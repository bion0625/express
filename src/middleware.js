import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";

const s3 = new aws.S3({
    credentials: {
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET,
    }
})

const isFly = process.env.NODE_ENV === 'production';
// NODE_ENV=production ==> 서버에 자동설정

const s3ImageUploader = multerS3({
    s3: s3,
    bucket: 'bion-wetube/images',
    acl: 'public-read',
})

const s3VideoUploader = multerS3({
    s3: s3,
    bucket: 'bion-wetube/videos',
    acl: 'public-read',
});

export const localsMiddleware = (req, res, next) => {
    res.header("Cross-Origin-Embedder-Policy", "credentialless");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName = "express";
    res.locals.loggedInUser = req.session.user || {};
    res.locals.isFly = isFly;
    next();
};

export const protectorMiddleware = (req, res, next) => {
    if(req.session.loggedIn){
        return next();
    }else{
        req.flash("error", "Log in first");
        return res.redirect("/login");
    }
};

export const publicOnlyMiddleware = (req, res, next) => {
    if(!req.session.loggedIn){
        return next();
    } else {
        req.flash("error", "Not authorized");
        return res.redirect("/");
    }
};

export const avatarUpload = multer({
    dest:"uploads/avatars/", 
    limits:{
        fileSize:300000
    },
    storage: isFly ? s3ImageUploader : undefined,
});
export const videoUpload = multer({
    dest:"uploads/videos/", 
    limits:{
        fileSize:100000000
    },
    storage: isFly ? s3VideoUploader : undefined,
});