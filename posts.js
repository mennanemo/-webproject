fetch("data.json")//read json
.then(hold=> hold.json()) //unlock w 22raha
.then(data =>
{
 const readparam = new URLSearchParams(window.location.search);
 const id = parseInt(readparam.get("id"));
 const user = data.users.find(u=>u.id === id);
 const placepost = document.getElementById("posts");

 user.post.forEach(p => {
    const newelement=document.createElement("div");
    newelement.textContent= p;
    newelement.classList.add("postcss");
   
    placepost.appendChild(newelement);
 });
}
)