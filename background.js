fetch("data.json")//read json
.then(hold=> hold.json()) //unlock w 22raha
.then(data =>
{
 const readparam = new URLSearchParams(window.location.search);
 const id = parseInt(readparam.get("id"));
 const user = data.users.find(u=>u.id === id);
const wrapper =document.body;
 if (user.bgimage)
 {
 wrapper.style.backgroundImage=`url('${user.bgimage}')`;
 wrapper.style.backgroundSize = "cover";
 wrapper.style.backgroundPosition = "center";
 console.log(user);
 }
 else if (user.bgColor)
 {
 wrapper.style.backgroundColor=user.bgColor;
 }
}
)