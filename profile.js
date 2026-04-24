fetch("data.json")//read json
.then(hold=> hold.json()) //unlock w 22raha
.then(data => //23ml b 2l data kaza
{
 const readparam = new URLSearchParams(window.location.search); //hat 7tt ? f 2l url
 const id = parseInt(readparam.get("id")); //hat value 2l id w 7wloh int
 const user = data.users.find(u=>u.id === id);
 document.getElementById("profileimg").src= user.image;
 if (user.about2)
 {
 document.getElementById("theabout").textContent=user.about + " " + user.about2;
 }
 else
 {
    document.getElementById("theabout").textContent=user.about;
 }
 document.getElementById("flname").textContent=user.firstname + " "+user.lastname;


 const placej = document.getElementById("jobarray");
 user.job.forEach(jobies =>
 {
 const newelement = document.createElement("span");
 newelement.textContent= jobies;
 newelement.classList.add("tag");
 newelement.classList.add("jobies-css");
 placej.appendChild(newelement);
 }
 );

 const placesk= document.getElementById("skillie");
 user.skills.forEach( sk=>
 {
    const newelement = document.createElement("span");
 newelement.textContent=sk;
 newelement.classList.add("tag");
 newelement.classList.add("skills-css");
 placesk.appendChild(newelement);

 } );

const placeww =document.getElementById("workedwith");
if (user.Providedf )
{
   user.Providedf.forEach( pid =>
   {
      const client = data.users.find(c =>c.id === pid);
   
   if (client)
   {
      const newelement = document.createElement("span");
      newelement.textContent=client.firstname+" "+client.lastname;
      newelement.classList.add("tag");
      newelement.classList.add("client-css");
      placeww.appendChild(newelement);
   }
   });
}




}

)