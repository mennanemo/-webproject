document.addEventListener("DOMContentLoaded",function(){
fetch("/data.json")//read json
.then(hold=> hold.json()) //unlock w 22raha
.then(data =>
{
 const readparam = new URLSearchParams(window.location.search);
 const id = parseInt(readparam.get("id"));
 const user = data.users.find(u=>u.id === id);
 try {
 if (user.type == 2 && user.post) {
  const placepost = document.getElementById("posts");



Object.entries(user.post).forEach(([k,data])=> {
    const card = document.createElement("div"); //post card
    card.classList.add("postcard-item");
  
 
  
    const img = document.createElement("img"); //sort 2l user
    img.src = (user.image && user.image != '') ? user.image : "/images/emptypf.jpg";
    img.classList.add("post-userimg");
    img.style.cursor="pointer";
     img.addEventListener("click",() =>
     {
       window.location.href = "profile.html?id=" + user.id;
     }
     )
  
         const text = document.createElement("div");
    text.textContent = data.text;
    text.classList.add("postcss");

    
    const postername = document.createElement("a"); //2sm 2l user
    postername.classList.add("posternamecss");
    postername.textContent= user.firstname +" " +user.lastname;
    postername.href="profile.html?id="+user.id;
   
     const postimg = document.createElement("img");
      if (data.image && data.image != '') {
   
    postimg.src = data.image;
    postimg.classList.add("post-img");
    card.appendChild(postimg);
  }

const line = document.createElement("div");
line.classList.add("post-line");
line.id = "line";

 const btn = document.createElement("button");
 btn.id= "react" ;
 btn.classList.add("but");
 btn.innerHTML =  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
</svg> Love`;
btn.addEventListener("click", () => {
  btn.classList.toggle("loved");

});
 line.appendChild(btn);


 const btnt = document.createElement("a");
 btnt.id= "message";
 btnt.classList.add("but");
btnt.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
</svg> Message`;
btnt.href="chat.html?"+ user.id;
 line.appendChild(btnt);

 const btnth = document.createElement("button");
 btnth.id= "share";
 btnth.classList.add("but");
 btnth.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
</svg> Share`;
 line.appendChild(btnth);
const header = document.createElement("div");
header.classList.add("post-header");

header.appendChild(img);
header.appendChild(postername);

    card.appendChild(header);
    card.appendChild(text);
      card.appendChild(postimg);
    card.appendChild(line);

    placepost.appendChild(card);




   btnth.addEventListener("click", () => {
  const link = window.location.origin + "/profile.html?id=" + user.id;
  navigator.clipboard.writeText(link);
  btnth.innerHTML = `✓ Copied!`;
  /*bystna w2t then run */setTimeout(() => { btnth.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
  <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
</svg> Share`; }, 2000);
});



  });
}

}
 

catch (error)
{
   console.log("check user posting js")
}
}
)
    .catch(err => console.error("Fetch failed:", err));
});
