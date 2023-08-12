const textReadContainer = document.getElementById('textReadContainer');
const textCommentContent = document.getElementById('textCommentContent');
const textCommentAddBtn = document.getElementById('textCommentAddBtn');
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
    const textComments = document.querySelector(".text__comments ul");
    const newComment = document.createElement("li");
    newComment.dataset.id = id;
    newComment.className = "text__comment";
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
    textComments.prepend(newComment);
};

const handleSubmit = async () => {
    const content = textCommentContent.value;
    const textId = textReadContainer.dataset.id;
    if(content === ""){
        return;
    }
    const response = await fetch(`/api/texts/${textId}/comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({content}),
    });
    if(response.status === 201){
        const { newCommentId } = await response.json();
        addComment(content, newCommentId);
    }
    textCommentContent.value = "";
};

textCommentAddBtn.addEventListener("click", handleSubmit);

commentDeleteBtnList.forEach(element => {
    element.addEventListener("click", deleteComment);
});