fetch("data.json")//read json
.then(hold=> hold.json()) //unlock w 22raha
.then(data =>
{
 const readparam = new URLSearchParams(window.location.search); //hat 7tt ? f 2l url
 const id = parseInt(readparam.get("id")); //hat value 2l id w 7wloh int
 const isadmin = readparam.get("admin")==="true";
 const user = data.users.find(u=>u.id === id);
 if (isadmin)
 {
    const placed =document.getElementById("delete");
  const deletebtn = document.createElement('button');
  deletebtn.textContent = "Delete User";
  deletebtn.style.width="100%"
   deletebtn.style.height = "100%";
      deletebtn.style.cursor = "pointer";
      deletebtn.style.backgroundColor = "#70191D";
      deletebtn.style.color = "white";
      deletebtn.style.fontSize = "16px";
   deletebtn.addEventListener("click",function()
    {
     alert("USER DELETED");
    })
    placed.appendChild(deletebtn);
}
}
)