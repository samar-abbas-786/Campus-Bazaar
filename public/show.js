getData = async () => {
  const response = await fetch("/api/user");
  const htmlContent = await response.json(); // Get the HTML content
  console.log(htmlContent);

  for (i = 0; i < htmlContent.length; i++) {
    console.log(i);
    console.log(htmlContent[i].Name);
    console.log(htmlContent[i].Price);
    document.getElementById("name").innerHTML = htmlContent[i].Name;
    document.getElementById("price").innerHTML = htmlContent[i].Price;
    document.getElementById("image").src =
      "/uploads/" + htmlContent[i].productImage;
  }
};

window.onload = () => {
  getData();
};
