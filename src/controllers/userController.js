import User from "../models/User";
import Video from "../models/Video";
import Text from "../models/Text";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", {pageTitle:"Create Account"});
export const postJoin = async (req, res) => {
    const pageTitle = "Create Account";
    const{email, username, password, password2, name, location} = req.body;
    if(password !== password2){
        return res.status(400).render("join", {pageTitle: pageTitle, errorMassage:"Password confirmation does not match."});
    }
    const userExists = await User.exists({$or:[{email}, {username}]});// or절 where users.email = email or users.username = username
    if(userExists){
        return res.status(400).render("join", {pageTitle: pageTitle, errorMassage:"This username or email is already taken."});
    }
    try{
        await User.create({
            email, username, password, name, location
        });
        return res.redirect("/login");
    }catch (error){
        return res.status(400).render("join", {
            pageTitle: pageTitle,
            errorMessage: error._message
        });
    }
};
export const getLogin = (req, res) => res.render("login", {pageTitle:"Log in"});
export const postLogin = async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({username, socialOnly: false});
    const pageTitle = "Login";
    if(!user){
        return res.status(400).render("login", {pageTitle, errorMassage:"An account with this username does not exists."})
    }
    const ok = await bcrypt.compare(password, user.password);
    if(!ok){
        return res.status(400).render("login", {pageTitle, errorMassage:"Wrong password."})
    }
    req.session.loggedIn = true;
    req.session.user = user;
    res.redirect("/");
}

export const startGithubeLogin = (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id:process.env.GH_CLIENT,
        allow_signup:false,
        scope:"=read:user user:email"
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
};

export const finishGithubeLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id:process.env.GH_CLIENT,
        client_secret:process.env.GH_SECRET,
        code:req.query.code
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (await fetch(finalUrl, {
        method:"POST",
        headers:{
            Accept: "application/json"
        }
    })
    ).json();
    if("access_token" in tokenRequest){
        const {access_token} = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await (
            await fetch(`${apiUrl}/user`,{
            headers:{
                Authorization: `Bearer ${access_token}`
            },
        })
        ).json();
        const emailData = await (
            await fetch(`${apiUrl}/user/emails`,{
            headers:{
                Authorization: `Bearer ${access_token}`
            },
        })
        ).json();
        const emailObj = emailData.find(
            (email) => email.primary === true && email.verified === true
        );
        if(!emailObj){
            return res.redirect("/login");
        }
        let user = await User.findOne({email: emailObj.email});
        if(!user){
            user = await User.create({
                avatarUrl:userData.avatar_url,
                email:emailObj.email, 
                username:userData.login, 
                socialOnly: true,
                password:"", 
                name:userData.name, 
                location: userData.location === null ? "" : userData.location
            });
        }
        req.session.loggedIn = true;
        req.session.user = user;
        res.redirect("/");
    }else{
        return res.redirect("/login");
    }
}

export const logout = (req, res) => {
    req.session.destroy();
    // req.flash("info", "Bye Bye");
    return res.redirect("/");
};

export const getEdit = (req, res) => {
    return res.render("edit-profile", {pageTitle: "Edit Profile"});
};
export const postEdit = async (req, res) => {
    const {
        session : {
            user: { _id, avatarUrl }
        }, 
        body: { name, email, username, location },
        file,
    } = req;
    try{
        const isFly = res.locals.isFly;
        const updatedUser = await User.findByIdAndUpdate(
        _id, 
        {
            avatarUrl:file ? (isFly ? file.location : '/'+file.path) : avatarUrl,
            name, 
            email, 
            username, 
            location
        },
        { new : true });
        // req.session.user = {
        //     ...req.session.user,
        //     name, 
        //     email, 
        //     username, 
        //     location
        // };
        req.session.user = updatedUser;
        return res.redirect("/users/edit");
    }catch(error){
        const modifyText = req.session.user.username !== username && req.session.user.email !== email ? "email and username" : req.session.user.username !== username ? "username" : "email";
        let errorMassage = `This ${modifyText} is already taken.`;
        if(error.codeName !== "DuplicateKey"){
            errorMassage = "call the admin!";
        }
        return res.status(400).render("edit-profile", {pageTitle: "Edit Profile", errorMassage});
    }
};

export const getChangePassword = (req, res) => {
    if(req.session.user.socialOnly === true){
        req.flash("error", "Can't change password.");
        return res.redirect("/");
    }
    return res.render("users/change-password", {pageTitle:"Change Password"});
};

export const postChangePassword = async (req, res) => {
    const {
        session : {
            user: { _id, password }
        }, 
        body: { oldPassword, newPassword, newPasswordConfirmation }
    } = req;
    const ok = await bcrypt.compare(oldPassword, password);
    if(!ok){
        return res.status(400).render("users/change-password", {pageTitle:"Change Password", errorMassage:"The current password is incorrect"});
    }
    if(newPassword !== newPasswordConfirmation){
        return res.status(400).render("users/change-password", {pageTitle:"Change Password", errorMassage:"The password does not match the confirmation"});
    }
    const updatePassword = await bcrypt.hash(newPassword, 5);
    const user = await User.findByIdAndUpdate(_id,{password:updatePassword},{new:true});
    req.session.user = user;
    req.flash("info", "Password Updated");
    return res.redirect("/users/logout");
};

export const see = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if(!user){
        return res.status(404).render("404", {pageTitle:"User not found."});
    }
    const texts = await Text.find({owner:id})
    return res.render("users/profile", {pageTitle: user.name, user, texts});
};