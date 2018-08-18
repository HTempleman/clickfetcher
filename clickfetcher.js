
/**
The script below concerns itself with fetching images and placing them into HTML div containers. The two javascript APIs that make this possible are "Intersection Observer" and "Fetch".

    -The first set of functions employs IntersectionObserver() to load images into a preassigned 'foreground' HTML div container once it has entered the client's viewport.

    -The second set of functions employs fetch() to load other HTML div containers once their corresponding buttons have been clicked.

These are so-called "lazy-loading" functions that have the benefit of retrieving data on demand for the client, drastically reducing initial bandwidth outlay (IBO?) for the server. Additionally, the Fetch API's promise chaining allows for asynchronous HTTP requests that enable active javascript requests to hang innocuously in the background while they await a response.

Because this script is interacting with the server and the HTML & CSS source files, there is some light configuration required across the stack to make sure things flow swimmingly. But not too much configuration! :D

TL;DR: These functions are computationally inexpensive ways to retrieve data on demand. And without further ado...
*/


/** Intersection Observer API implementation */

/** Collect all of the HTML image elements that are marked up to lazy load */

const imageElementsToLazyLoad = document.querySelectorAll('.js-lazy-image');

const intersectionObserverConfig = {
  /** If the image gets within 50px in the Y axis, start the download. */

  rootMargin: '50px 0px',
  threshold: 0.01

};

/** Create an observer for the collected HTML image elements.*/

let observer = new IntersectionObserver(onIntersection, intersectionObserverConfig);
  imageElementsToLazyLoad.forEach(image => {
    observer.observe(image);
});

/** A function that pulls a predefined file pathway from an HTML elements data-src and places it into the element's src attribute. */

function lazyLoadImage(newImage) {
  var observedSRC = newImage.dataset.src;
  newImage.src = observedSRC;
}

/** The following snippet was pretty directly lifted from a blog post by Dean Hume */

function onIntersection(entries) {
  /** Loop through the entries */
  entries.forEach(entry => {
    /** Are we in viewport? */
    if (entry.intersectionRatio > 0) {
      /** Stop watching and load the image */
      observer.unobserve(entry.target);
        lazyLoadImage(entry.target);
        entry.target.parentElement.classList.remove("pic-fadeout");
        entry.target.parentElement.classList.add("pic-fadein");
      }
  });
}



/** Fetch API implementation */

function picSwitch(clickedElement){

/** This conditional statement checks if the HTML div contains any children and proceeds to ascertain the element's ID. This ID should correspond to a folder of images on the server side and any related CSS that will be manipulated.*/

  if (divChild == null){
    var btnName = clickedElement.target.id;
    var imgDirectoryPath = "path/to/image/folder" + btnName + "/";
    var jsonListLocation = imgDirectoryPath + btnName +".json";


    /** Here we fade out any foreground images that were populated by the Intersection Observer used in the first code group.*/

    var foregroundImgDivs = document.getElementsByClassName("foreground")[0];
    var foregroundImgArray = foregroundImgDivs.children;

    if(foregroundImgArray[0].classList[1]="pic-fadein"){
        for(let i = 0; i < foregroundImgArray.length; i++){
          foregroundImgArray[i].classList.remove("pic-fadein");
        }
    }

    /** Here is the mother function for the 4 ensuing functions. It should accept a JSON list of image files corresponding to the HTML ID collected into the btnName variable. */

    function populatePicDivs(jsonListDir){
      fetch(jsonListDir)
      .then(readList)
      .then(fetchAllImages)
    }

    /** Ferry the JSON list client-side. */

    function readList(response){
      return response.json();
    }

    /** Iterate through the JSON list, pulling an image file from the requested directory at each step. */

    function fetchAllImages(jsonImgList){
      for(var i = 0; i < jsonImgList.length; i++){
        var newDirectoryPath = imgDirectoryPath + jsonImgList[i];
        fetch(newDirectoryPath)
        .then(profferIMG)
        .then(appendIMG)

      }
    }

    /** Return blob describing whichever image file is being delivered. */

    function profferIMG(response){
      return response.blob();
    }

    /** Use the image returned by profferIMG as an argument in appendIMG. */

    function appendIMG(blob){

      /** Create HTML image element and assign the blob url as its source. */

      var imgURL = URL.createObjectURL(blob);
      var nextIMG = document.createElement('img');
      nextIMG.src = imgURL;

      /** Create a container div and append the image to it. */

      var containerDiv = document.createElement('div');
      containerDiv.appendChild(nextIMG);

      /** Append the fresh container div, with its image, to the mother container corresponding to the clicked button. */

      var divName = document.getElementsByClassName(btnName)[0];
      var divChild = divName.firstChild;
      divName.appendChild(containerDiv);
      var newImgClass = "imgContainer";
      containerDiv.classList.add(newImgClass);
    }

    /** Now that the functions are strung together correctly, use the populatePicDivs mother function to request that JSON list of images from the location described by the jsonListLocation variable. After that, you're done! Everything is loaded and ready to be brought to the foreground.*/

    populatePicDivs(jsonListLocation);

  }


/** Adjust the CSS styles whenever a 'pictures' button is clicked */

var allDivs = document.getElementsByClassName("pictures");

  for(let i = 0; i < allDivs.length; i++){
    if(allDivs[i].classList.contains(btnName)){
      var desiredDiv = i;
    }else{
      allDivs[i].classList.add("pic-fadeout");
      allDivs[i].classList.remove("pic-fadein");
    }
  }
  allDivs[desiredDiv].classList.add("pic-fadein");
  allDivs[desiredDiv].classList.remove("pic-fadeout");


}

/** Create an observer that waits for a button to be clicked, thus initiating the whole shebang described up to this point. */

var btns = document.querySelectorAll('button');

for (let i=0; i<btns.length; i++){
  btns[i].onclick = picSwitch;
}
