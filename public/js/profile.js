document.addEventListener("DOMContentLoaded",function(){
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const loggedInId = currentUser?.id;
const loggedInRole = currentUser?.role;
 const readparam = new URLSearchParams(window.location.search);
const id = readparam.get("id");

fetch("/api/profile/"+ id)
.then(hold=> hold.json())
.then(user=>
{

if (loggedInId === user._id.toString() || loggedInRole === 'admin') {


  const placed =document.getElementById("delete");
  const deletebtn = document.createElement('button');
  deletebtn.textContent = "Delete User";
  deletebtn.style.width="100%"
   deletebtn.style.height = "100%";
      deletebtn.style.cursor = "pointer";
      deletebtn.style.backgroundColor = "#70191D";
      deletebtn.style.color = "white";
      deletebtn.style.fontSize = "16px";
  deletebtn.addEventListener("click", async function() {
  if (confirm("Are you sure you want to delete this user?")) {
    await fetch("/api/profile/" + user._id, { method: "DELETE" });
    window.location.href = "/views/index.html";
    
  }
  
});

placed.appendChild(deletebtn); 
}
 if(user.image && user.image!='')
 {
 document.getElementById("profileimg").src= user.image;

const overlay = document.getElementById("certOverlay");
const zoomed = document.getElementById("certZoomed");

document.getElementById("profileimg").style.cursor = "pointer";
document.getElementById("profileimg").addEventListener("click", () => {
   zoomed.classList.add("pfp-zoomed");
  zoomed.src = document.getElementById("profileimg").src;
  overlay.classList.add("active");
});

overlay.addEventListener("click", () => {
  overlay.classList.remove("active");
    zoomed.classList.remove("pfp-zoomed");
});

 }
 else
 {
   document.getElementById("profileimg").src= "/images/emptypf.jpg";
 document.getElementById("profileimg").style.cursor="default";
 }
if(user.pfbg && user.pfbg!='')
{
document.getElementById("bgimage").src= user.pfbg;
}
else
{
   document.getElementById("bgimage").src= "/images/emptybg.jpg";
}
 
    document.getElementById("theabout").textContent=user.about || "";
 
 document.getElementById("flname").textContent=user.firstname + " "+user.lastname;

if (loggedInId === user._id.toString()) {
  document.getElementById('editpf').style.display = 'block';
} else {
  document.getElementById('editpf').style.display = 'none';
}

   document.getElementById("editpf").href="/views/editpf.html?id="+user._id;




const placeww = document.getElementById("workedwith");

if (user.workedWith && user.workedWith.length > 0) {
user.workedWith.forEach(pid => {
  fetch("/api/profile/" + pid)
    .then(r => r.json())
    .then(client => {
      const newelement = document.createElement("a");
      newelement.textContent=client.firstname+" "+client.lastname;
      newelement.classList.add("tag");
      newelement.classList.add("client-css");
      newelement.href = "profile.html?id="+client._id;
      placeww.appendChild(newelement);
   }
   );
});
}

 if (user.role=='provider'){
   document.getElementById("contskillie").style.display = "block";
   document.getElementById("skillie").style.display = "block";
 const placesk= document.getElementById("skillie");
 user.skills.forEach( sk=>
 {
    const newelement = document.createElement("span");
 newelement.textContent=sk;
 newelement.classList.add("tag");
 newelement.classList.add("skills-css");
 placesk.appendChild(newelement);
 
 } )

 }
 else{
             document.getElementById("contskillie").style.display = "none";
  document.getElementById("skillie").style.display = "none";
 }




}
)
.catch(err=>console.error ("fetch failed",err));
});
