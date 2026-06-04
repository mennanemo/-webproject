document.addEventListener("DOMContentLoaded",function(){
fetch("/data.json")
.then(hold=> hold.json())
.then(data =>
{
 const readparam = new URLSearchParams(window.location.search);
 const id = parseInt(readparam.get("id"));
 const user = data.users.find(u=>u.id === id);

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
 if (user.about2)
 {
 document.getElementById("theabout").textContent=user.about + " " + user.about2;
 }
 else
 {
    document.getElementById("theabout").textContent=user.about;
 }
 document.getElementById("flname").textContent=user.firstname + " "+user.lastname;

 const placeww =document.getElementById("workedwith");
if (user.Providedf )
{
   user.Providedf.forEach( pid =>
   {
      const client = data.users.find(c =>c.id === pid);
   
   if (client)
   {
      const newelement = document.createElement("a");
      newelement.textContent=client.firstname+" "+client.lastname;
      newelement.classList.add("tag");
      newelement.classList.add("client-css");
      newelement.href = "profile.html?id="+client.id;
      placeww.appendChild(newelement);
   }
   });
}

 if (user.type==1){
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
