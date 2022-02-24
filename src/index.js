document.addEventListener("change", (event) => {
  console.log(event.target);
  console.log(event.target.type);
  console.log(event.target.value);

  //   if (event.target.type == "radio") {
  //     console.log(event.target.value);
  //   }
  //   if (event.target.id == "userEnterRate") {
  //     console.log("user rate: ");
  //     console.log(event.target.value);
  //   }
});
