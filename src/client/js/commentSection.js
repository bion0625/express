const videoContainer = document.getElementById('videoContainer');
const form = document.getElementById('commentForm');
const commentDeleteBtnList = document.querySelectorAll('.comment__delete');

const deleteComment = async (event) => {
    const commentId = event.target.parentElement.dataset.id;
    const {status} = await fetch(`/api/comment/${commentId}/delete`, {method:"DELETE"});
    if(status === 200){
        const delElement = event.target.parentElement;
        delElement.remove();
    }
};

const addComment = (text, id) => {
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    newComment.dataset.id = id;
    newComment.className = "video__comment";
    const icon = document.createElement("i");
    icon.className = "fas fa-comment";
    const span = document.createElement("span");
    span.innerText = `  ${text}`;
    const span2 = document.createElement("span");
    span2.innerText = "  ❌";

    span2.className = "comment__delete";
    span2.addEventListener("click", deleteComment);

    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(span2);
    videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
    const textarea = form.querySelector('textarea');
    event.preventDefault();
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;
    if(text === ""){
        return;
    }
    const response = await fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({text}),
    });
    if(response.status === 201){
        const { newCommentId } = await response.json();
        addComment(text, newCommentId);
    }
    textarea.value = "";
};

if(form){
    form.addEventListener("submit", handleSubmit);
}

commentDeleteBtnList.forEach(element => {
    element.addEventListener("click", deleteComment);
});