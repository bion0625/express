const contaner = document.getElementById('textReadContainer');
const textDelete = document.getElementById('textDelete');

const textDeleteHandler = async () => {
    const { status } = await fetch(`/text/delete/${contaner.dataset.id}`, {method:"DELETE"});
    alert(status);
};

textDelete.addEventListener("click", textDeleteHandler);