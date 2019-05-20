//Registreren By Tona Pulido

first = document.getElementById("first")
registerOne = document.getElementById("registerOne")

registerTwo = document.getElementById("registerTwo")
registerContainer = document.getElementById("register-container")

document.getElementById("nextOne").addEventListener("click", show);
document.getElementById("nextTwo").addEventListener("click", showTwo);

function show(){
	first.classList.add("hide");

registerOne.classList.add("show");

registerContainer.classList.add("show");
}
function showTwo(){
registerTwo.classList.add("show");
registerOne.classList.remove("show");
}

