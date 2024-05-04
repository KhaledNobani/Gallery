/**
 * @author Khalid Nobani
 * @Plugin Photo Gallery
 * @Version Beta version 1.0
 */
try {
	(function( $ ) {
		var	settings = {
				sectTransition: 500,
				numberOfImagesInSection: 10,
				numberOfImagesInThumnailSection: 30,
				galleryViewMode: "filmStrip"
			},
			numberOfImages = $( ".gallery-thumb" ).find("img").length || $( ".gallery-thumbList" ).find("img").length,
			sizeOfThumbnail = 100 / settings.numberOfImagesInSection,
			totalThumbWidth = numberOfImages * ( $(".thumb-image img").width() ),
			endOfSection = ( $( "#photo-gallery" ).hasClass("filmstrip-view") ) ? Math.ceil( numberOfImages / settings.numberOfImagesInSection) :  Math.ceil( numberOfImages / settings.numberOfImagesInThumnailSection ),
			imageElements =[],
			actualSizeOfThumbailScroller = $(".gallery-thumb").width() / endOfSection ,
			imageObject = new Image(),
			imagesOnStage = $(".thumb-image[rel='group1']"),
			imagesOnThumbnailView =  $(".thumbList-image[rel='group1']"),
			currentImage = $("#photo-gallery").find("#viewer-image"),
			currentImageOnThumbnailView = '',
			activedImage = $("#photo-gallery").find(".active-thumbImage"),
			arrayOfImages = [],
			preloadCounter = 1;
			defaults = {
				scrollAmmount: 750, 
				currentSection: 1,	
				numberOfImages: numberOfImages,
				totalThumbWidth: totalThumbWidth,
				endOfSection: endOfSection,
				currentImageIndex: 0,
				firstImage: $(".thumb-image:first-child").attr("href"),
				firstImageTitle : $(".thumb-image:first-child").attr("title") || $(".thumb-image:first-child").children().attr("title"),
				firstImageObj: $(".thumb-image:first-child"),
				numberOfImagesOnStage: $(".thumb-image[rel='group1']").length || $(".thumbList-image[rel='group1']").length,
				imageOnStage: $("#photo-gallery").find("#viewer-image").attr("src"),
				numberOfImagesInGroup: $(".thumb-image[rel='group1']").length || $(".thumbList-image[rel='group1']").length
			},
			clicked = false,
			$imageViewerContainerTemplate = $("<div id='image-viewer' class='line hideItem' > <span class='exit-gallery'></span> <img id='viewer-content' /> <div class='imageViewer-title'>Image 12</div></div>"),
			$imageTransitionArrowTemplate = "<span class='prev-image imageTransition-icon'> <img alt='previous image' src='assets/img/prev-image.png' > </span>" +
			"<span class='next-image imageTransition-icon'> <img alt='next image' src='assets/img/next-image.png' > </span>",
			$indicationContentTemplate = " <div class='line indication-content middleColor'> " +
				"<div class='left-col small-padding image-title lh-1p6em'> Image title </div>" +
 				"<div class='right-col small-padding section-indication'>" +
				"<span class='unit prev-section'> <img alt='Previous Section' title='Previous Section' src='assets/img/prev.png' > </span>" +
				"<span class='unit page-indication lh-1p6em small-margin'> <!-- Beginning of page-indication container -->" +
				"</span> <!-- End of page-indication container -->" +
				"<span class='unit next-section'> <img alt='Next Section' title='Next Section' src='assets/img/next.png' > </span>" +
				"</div>" +
				"</div>",
			$alternateViewTemplate = "<div class='line gallery-header lightBlue' >" +
				"<div class='unit gallery-title'> Photo Gallery </div>" +
			 	"<div class='colRight alternate-view'> <!-- Beginning of alternate view container-->" +
				"<span class='view-filmstrip'> <img src='assets/img/filmstripView-icon.png' alt='Filmstrip view' title='Switch to filmstrip view'> </span>" +
				"<span class='view-thumnlist'> <img src='assets/img/ThumbView-icon.png' alt='Thumbails view' title='Switch to thumbnails view'> </span>" +
				"</div> <!-- End of alternate view container -->" +
				"</div>",
			$galleryViewerTemplate = "<div class='gallery-viewer'> <!-- Beginning of gallery-viewer container -->" +
				"<img alt='Large Image' title='Large Image' src='' id='viewer-image' />" +
 				"</div> <!-- End of gallery-viewer container -->"
 			,
 			$thumbnailContainerTemplate = "<div class='thumbnail-container'></div>",
 			$preloaderTemplate = "<div class='preloader'> "+
				"<img alt='Preloader' title='Photo Gallery Preloader' src='assets/img/loader.gif' class='preloader-image'/>" +
				"<p class='preloader-text'>Loading</p>"+ 
				"</div>"
			,
			imageGalleryObject = {
				galleryViewer : {
					height: 0,
					width: 0
				},
				imageTransition : {
					height: 0,
					width: 0
				}	
			},
			methods = {
				getCurrentImage: function() { // getCurrentImage is reponsible to get the current image on the stage and return an object 
					var currentImageOnStage = currentImage.attr("src") || currentImageOnThumbnailView.attr("src"); // Assign the source of current image on the stage into currentImageOnStage variable
							
					for ( var i = 0; i < defaults.numberOfImagesInGroup; i++ ) { // Iterate over all images on the thumbnail list 
								
						if ( currentImageOnStage == imageElements[ i ].src ) { // Check if the current image on the stage is found on the image element array 
							return i; // Return the index of the current image on the stage that is found on the image element array
						}
				
					}
				},
				restoreToDefaultState: function( speed ){ // To restore the photo gallery into it default state 
					methods.showActiveImage( defaults.firstImageObj ); 
					methods.restoreCurrentSection();
					methods.showSectionPageIndicator();
					$(".gallery-thumb").animate({
							left: 0
					}, speed );
							
					$(".gallery-thumbList").animate({
							left: 0
					}, speed );
				},
				reinitializeEndOfSection: function() { // Reinitialize the value of endOfSection property
					defaults.endOfSection = ( $( "#photo-gallery" ).hasClass("filmstrip-view") ) ? Math.ceil( numberOfImages / settings.numberOfImagesInSection ) : Math.ceil( numberOfImages / settings.numberOfImagesInThumnailSection );	
				},
				assignNewWidthToGalleryThumb: function() {
					
					$( ".gallery-thumb" ).css({
						width: defaults.totalThumbWidth + "px"
					});
					
					$(".gallery-thumbList").css({
						width: ( 750 * defaults.endOfSection ) + "px"
					}); 
					
				},
				reinitializeValues: function() { // Reinitialize all values needed for updating the gallery state
					this.showImageTitle(defaults.firstImageTitle);
					this.restoreToDefaultState(400);
					this.reinitializeEndOfSection();
					this.assignNewWidthToGalleryThumb();
					this.showSectionPageIndicator();
				},
				restoreCurrentSection: function() { // Restore the current image section value to 1 
					defaults.currentSection = 1;	
				},
				getActivedImage: function() { // Get active image on the stage and return an object of that actived object
					var activedImg = $("#photo-gallery").find(".active-thumbImage"); // Assign the actived image object into activedImg variable
					return activedImg; // Return the actived image object 
				},
				preloadAllImages: function( element ) { // Preload all large images that needed to be displayed on the stage in large size
					element.each( function() { // Loop through all large images 
						var newImage = new Image();
						newImage.src  = ( $(this).attr("href") ); // Assign the source of the image into imageObject src attribute 
						newImage.onload = function() {
							console.log( preloadCounter + "..." );
							preloadCounter++;
							
							if ( preloadCounter < numberOfImages ) {
								$(".preloader").remove();
							}
						}
					});
					
				},
				printImageArrayValues: function (array) {
					for (var i=0; i < array.length; i++) {
						console.log("Array src : "+array[i].src);
						console.log("Array title : "+array[i].title);
						console.log("Array class : "+array[i].className);
						console.log("Array group : "+array[i].group);
						
					}
				},
				assignImagesIntoArray: function() { // Get all images src and assign it into imageElement array 
							
					imagesOnStage.each( function( i ) {
						var imageObject = {
							src: $(this).attr("href") || '',
							title: $(this).children().attr("title") || '',
							className: $(this).attr("class") || '',
							group: $(this).attr("rel")
						};
						imageElements[ i ] = imageObject;
					});
					
					methods.printImageArrayValues(imageElements);
							
					imagesOnThumbnailView.each( function( i ) {
						var imageObject = {
							src: $(this).attr("href") || '',
							title: $(this).children().attr("title") || '',
							className: $(this).attr("class") || '',
							group: $(this).attr("rel")
						};
						
						imageElements[ i ] = imageObject;
					});
					
					methods.printImageArrayValues(imageElements);
					
				},
				showSectionPageIndicator: function() {
					$(".page-indication").text( defaults.currentSection +" / " + defaults.endOfSection );
				},
				showGalleryViewer: function( imgSrc ) {
							
					var imageSource = imgSrc || defaults.firstImage;
					
					if ( $( "#photo-gallery" ).hasClass("filmstrip-view") ) {
						$("#viewer-image")
						.attr( "src", imageSource );
					} else if ( clicked ) {
						$("#image-viewer").show();
						$("#viewer-content").attr( "src", imgSrc );
						currentImageOnThumbnailView = $("#image-viewer").find("#viewer-content");
					}
	
				},
				moveToPrevSection: function() { // moveToPrevSection is to move the current section to previous section 
					if ( defaults.currentSection > 1 ) { // Check if the current section is not in the origin of the image section
								
						$(".gallery-thumb").animate({ // Move the gallery-thumb to the left by specific ammount based on the scrollAmmount value
							left: "+=" + defaults.scrollAmmount
						}, settings.sectTransition );
								
						$(".gallery-thumbList").animate({ // Move the gallery-thumbList to the left by specific ammount based on the scrollAmmount value
							left: "+=" + defaults.scrollAmmount
						}, settings.sectTransition );
								
						defaults.currentSection--;
						methods.showSectionPageIndicator();
						var i =methods.getCurrentImage();
					} else {
						return;
					}
							
				},
				bindPrevSection: function() { // Bind an event of the moveToPrevSection 
					$(".prev-section").live( "click", methods.moveToPrevSection ); // Bind an event handler for prev-section
				},
				moveToNextSection: function() {
					if ( defaults.currentSection < defaults.endOfSection ) { // Check if the current section is not in the end of image section
								
						$(".gallery-thumb").animate({ // Move the gallery-thumb to the left specified by scrollAmmount
							left: "-=" + defaults.scrollAmmount
						}, settings.sectTransition );
								
						$(".gallery-thumbList").animate({ // Move the gallery-thumbList to the left specified by scrollAmmount
							left: "-=" + defaults.scrollAmmount
						}, settings.sectTransition ); 
								
						defaults.currentSection++; // Increase the value of current image section by 1
						methods.showSectionPageIndicator(); // Change the value of current section page indicator
								
					} else {
						return;
					}
							
				},
				bindNextSection: function() {
					console.log("Bind next section has been called .... ");
					$(".next-section").live( "click", methods.moveToNextSection );
				},
				moveToNextImage : function() {
					defaults.currentImageIndex = parseInt( methods.getCurrentImage() ) + 1 ;  // Get the current image index and add 1 in order to move to the next image 
							
					if ( defaults.currentImageIndex < defaults.numberOfImages ) { // Check if the current image index is not equal to the last index of the image
								
						var endOfImageSection = ( ( defaults.currentSection ) * settings.numberOfImagesInSection ) -1  ; // Get the end of image in section in order to move to the next image section
								
						if ( defaults.currentImageIndex <= endOfImageSection ) { // Check if the current image index in not exceeding the last index of current image section
									
							if ( $( "#photo-gallery" ).hasClass("filmstrip-view") ) { // Check if the photo-gallery is in filmstrip mode 
								methods.showGalleryViewer( imageElements[ defaults.currentImageIndex ].src ); // Call the showGalleryViewer method for filmstrip mode
							} else if ( $( "#photo-gallery" ).hasClass( "thumbnail-view" ) ) { // Check if the photo-gallery is in thumbnail-view mode 
								methods.showGalleryViewer( imageElements[ defaults.currentImageIndex ].src ) // Call the showGalleryViewer method for thumbnail-view mode
							}
						
						} else { // If the current image index is exceeding the last index of the current image section then apply the following code 
							methods.moveToNextSection(); // Move the image sction to the next section
							defaults.beginOfImageSection += settings.numberOfImagesInSection; // Change the value of beginOfImageSection to the new value based on the numberOfImagesInSection
							methods.showGalleryViewer( imageElements[ defaults.currentImageIndex ].src ); // Then show the new image on the stage by calling showGalleryViewer method
						}
							
					activedImage = methods.getActivedImage(); // Get the current active image 
					methods.activateImage( "next" ); // Activate the next image	
					 
								
					} else { // If the current image index is equal to the last index of the end of image section return nothing
						return;
					}
							
				},
				bindNextImage: function() {
					$(".next-image").live( "click", methods.moveToNextImage ); // Bind an event handler ( moveToNextImage ) for next-image element 
				},
				moveToPrevImage : function() {
					
					defaults.currentImageIndex = parseInt( methods.getCurrentImage( $(this) ) ) ;
					if ( defaults.currentImageIndex > 0 ) {
								
						var beginOfImageSection = defaults.currentSection * settings.numberOfImagesInSection - settings.numberOfImagesInSection;
						if ( beginOfImageSection < 0 ) beginOfImageSection = 0;
									
						defaults.currentImageIndex -= 1;	
						if ( defaults.currentImageIndex  >= beginOfImageSection ) {
									
							methods.showGalleryViewer( imageElements[ defaults.currentImageIndex ].src );
						
						} else {
							methods.moveToPrevSection();
							methods.showGalleryViewer( imageElements[ defaults.currentImageIndex ].src );
							activedImage = methods.getActivedImage();	
									
						}
								
						activedImage = methods.getActivedImage();
						methods.activateImage( "prev" );
								
					} else {
						return;
					}
							
				},
				bindPrevImage: function() {
					
					$(".prev-image").live( "click", methods.moveToPrevImage );
					
				},
				removeNonActiveImages: function() {
					
					$(".thumb-image").removeClass("active-thumbImage");
					$(".thumbList-image").removeClass("active-thumbImage");
					
				},
				showImageTitle: function( element ) {
					var title; 
					//console.log("Type of this element is " + typeof(element) );
					if ( typeof(element) === "object" ) {
						title = element.children().attr("title") || element.attr("title");
						//console.log("Type of this image "+element.attr("href"));
					} else if( typeof(element) === "string" ) {
						title = element;
					}
					
					$(".image-title").text( title );
					$(".imageViewer-title").text(title);
				},
				activateImage: function( type ) {
							
					if (type == "next" ) {
						if ($( "#photo-gallery" ).hasClass( "thumbnail-view" )) {
							
							var nextImage = methods.getCurrentImage();
							console.log("The value of nextImage is : "+nextImage);
							methods.showImageTitle( imageElements[nextImage].title);
							console.log("The next image title is " + imageElements[nextImage].title );
							
							
						} else {
							this.showActiveImage( activedImage.next() );
							this.showImageTitle( activedImage.next() );	
						}
						
					} else if ( type == "prev" ) {
						if ($( "#photo-gallery" ).hasClass( "thumbnail-view" )) {
							
							var prevImage = methods.getCurrentImage();
							console.log("The value of nextImage is : "+prevImage);
							methods.showImageTitle( imageElements[prevImage].title);
							console.log("The next image title is " + imageElements[prevImage].title );
							
						} else {
							this.showActiveImage( activedImage.prev() );
							this.showImageTitle( activedImage.prev() );	
						}
						
					}
							
				},
				showActiveImage: function( element ) {
							
					this.removeNonActiveImages();
					element.addClass("active-thumbImage");
							
				},
				showImageOnClick: function() {
					
					methods.showGalleryViewer( $(this).attr("href") );
					methods.showActiveImage( $(this ) );
					methods.showImageTitle( $(this) );
					var i =methods.getCurrentImage();
					return false;
					
				},
				bindImageClick: function() {
					
					$(".thumb-image").live( "click", methods.showImageOnClick );
					
				},
				showImageViewer: function() {
					
					clicked = true;
					methods.showGalleryViewer( $(this).attr("href") );
					methods.showImageTitle($(this));
					return false;
					
				},
				bindThumbListImageClick: function() {
					
					$(".thumbList-image").live( "click", methods.showImageViewer );	
					
				},
				closeImageViewer: function() {
					$("#image-viewer").hide();
				},
				show: function() {
					this.showGalleryViewer();
					this.showImageTitle( defaults.firstImageTitle );
					this.showSectionPageIndicator();
				},
				switchToThumbnailView: function() {
							
					var element = $(".gallery-viewer");
	
					currentImage.attr( "src", '' );
	
					$( "#image-viewer" ).find( "#viewer-content" ).attr( "src", $(".thumbList-image:first-child").attr("href") );
	
					$("#photo-gallery").removeClass("filmstrip-view").addClass("thumbnail-view").addClass("line").addClass("lightBlue");	
										
					//$($thumbnailContainerTemplate).appendTo(".gallery-thumbList");
					
					$(".thumb-image").each( function( i ) {
	
						$(this).attr( "class", "thumbList-image" );					

					});
					
					$( ".gallery-thumb").attr( "class", "gallery-thumbList" );
					/* New code */
					
					var templateIndex = 0, // This variable to stroe the index of template 
						numberOfTemplates = numberOfImages / settings.numberOfImagesInThumnailSection, // This variable to store the number of templates for thumbnails' images
						templateArray = [],
						maxHeight = 0;
					
					if (!($(".t").length)) {
						
						for (var i=0; i < numberOfTemplates; i++) {
						templateArray[i] = $("<div class='t'></div>");
						templateArray[i].appendTo(".gallery-thumbList");
						}	
					
						console.log("numberOfImages : " + numberOfImages );
						
						$(".thumbList-image").each(function (i) {
							if ( i == 0 ) {
								$(this).attr( "class", "thumbList-image" );		
							}
							if (i % settings.numberOfImagesInThumnailSection === 0 && i !=0) {
								templateIndex++;
							}
							
							templateArray[templateIndex].append($(this));
						
						});
						
						for ( var i=0; i < templateArray.length; i++ ) {
							if ( maxHeight < templateArray[i].height() ) {
								maxHeight = templateArray[i].height();
							} else {
								maxHeight = maxHeight;
							}
						}
						console.log(maxHeight);
						
					}
					
					
					/* End of New Code */
					$( ".gallery-thumbList" ).animate({
							"height" : "auto"
					}, "fast");
							
					methods.reinitializeValues();
					
					$(".indication-content").slideUp();
					$(".section-indication").appendTo(".gallery-header").addClass("marginTop-3px");
					
					$(".imageTransition-icon").fadeOut("normal", function() {
						element.slideUp( 400 );
					});
				},
				bindViewThumbnailClick: function() {
					$( ".view-thumnlist" ).live( "click", methods.switchToThumbnailView );
				},
				switchToFilmstripView: function() {
							
					methods.showActiveImage( defaults.firstImageObj );
						
					var element = $(".gallery-viewer");	
	
					clicked = false;
					
					currentImage.attr( "src", defaults.firstImage );
					
					$("#photo-gallery").removeClass("thumbnail-view").addClass("filmstrip-view").addClass("line").addClass("lightBlue");
					
				
					$(".thumbList-image").each( function( i ) {
							
						if ( i == 0 ) {
							$(this).attr( "class", "thumb-image active-thumbImage" );
						} else {
							$(this).attr( "class", "thumb-image" );
						}
								
					});
					
					$( ".gallery-thumbList").attr( "class", "gallery-thumb" ).css({
						"height": "auto"
					});
					
					$(".thumb-image").each(function () {
						$(this).appendTo(".gallery-thumb");
					});
					
					$(".t").remove();
					
					$( ".gallery-thumbList" ).animate({
							"height" : "auto"
					}, 300);
					
					$(".thumbnail-container").remove();
					
					methods.reinitializeValues();
					$(".indication-content").slideDown();
					$(".section-indication").removeClass("marginTop-3px");
					$(".section-indication").appendTo(".indication-content");
					
					element.slideDown( "normal", function() {
						$(".imageTransition-icon").fadeIn("slow");
					});
				},
				bindViewFilmstripClick: function() {
					
					$(".view-filmstrip").live( "click", methods.switchToFilmstripView );
					
				},
				closeImageViewerOnClick: function () {
					methods.closeImageViewer();
				},
				closeImageViewerOnEscapePress: function( event ){
					
					if ( event.which == 27 ) {
						methods.closeImageViewer();
					}	
					
				},
				bindEscapePress: function() {
					
					$(document).keyup( function( event ) {
						methods.closeImageViewerOnEscapePress( event );
					}); 	
					
				},
				bindExitGalleryClick: function () {
					$(".exit-gallery").live("click", methods.closeImageViewerOnClick)
				},
				positioningPrevImage: function() {
					
					$( ".prev-image" ).animate({
						top: imageGalleryObject.galleryViewer.height / 2,
						left: 12
					});
					
				},
				positioningNextImage: function() {
					
					$( ".next-image" ).animate({
						top: imageGalleryObject.galleryViewer.height / 2  ,
						right: 12
					});
					
				},
				positioningImageArrow: function() {
					
					this.positioningPrevImage();
					this.positioningNextImage();
					
				},
				setNewValues: function() {
					
					imageGalleryObject.galleryViewer.height = $('.gallery-viewer').outerHeight();
					imageGalleryObject.galleryViewer.width = $('.gallery-viewer').outerWidth();
					imageGalleryObject.imageTransition.height = $(".imageTransition-icon").outerHeight();
					imageGalleryObject.imageTransition.width = $(".imageTransition-icon").outerWidth();
					
				},
				initializePositioning: function() {
	
					this.setNewValues();
					this.positioningImageArrow();
					
				},
				setFilmstripThumnail: function() {
					
					var newWidth = 750 / settings.numberOfImagesInSection;
					
					$(".thumb-image img").css({
						width:  newWidth  + "px",
						heigth: 40+"px",
					});
					
				},
				setThumbnailSize: function() { 
					this.setFilmstripThumnail();	
				},
				bindEvents: function() {
					
					this.bindImageClick(); // 1
					this.bindNextImage(); // 2
					this.bindPrevImage(); // 3
					this.bindPrevSection(); // 4
					this.bindNextSection(); // 5
					this.bindThumbListImageClick(); // 6
					this.bindViewThumbnailClick(); // 7
					this.bindViewFilmstripClick(); // 8
					this.bindEscapePress(); // 9
					this.bindExitGalleryClick(); // 10
					
				},
				appendImageTransitionArrow: function( template ) {
					$(".gallery-viewer").append(template);
					$("#image-viewer").append(template);
					$( $alternateViewTemplate ).prependTo( "#photo-gallery" );
					$( $indicationContentTemplate ).insertAfter('.gallery-viewer');
				}, /* 19/09/2012 */
				appendPreloaderTemplate: function (template) {
					$("#photo-gallery").append(template);
				},
				appendTemplateIntoPage: function() {
					this.appendImageTransitionArrow( $imageTransitionArrowTemplate );
					this.appendPreloaderTemplate($preloaderTemplate);
					
				},
				appendGalleryViewerTemplate: function (template) {
					$("#photo-gallery").append(template);	
				},
				init: function() {
					
					$imageViewerContainerTemplate.appendTo("#photo-gallery"); // 1 
					$( "#image-viewer" ).find( "#viewer-content" ).attr( "src", $(".thumbList-image:first-child").attr("href") ); // 2
					this.assignNewWidthToGalleryThumb(); // 3
					this.setThumbnailSize(); // 4
					this.assignImagesIntoArray(); // 5
					this.appendTemplateIntoPage(); // 8
					this.initializePositioning(); // 7
					this.bindEvents(); // 8
					this.show(); // 9
					this.preloadAllImages( imagesOnStage ); // 10
					
				}
			};
		
		$.fn.photoGallery = function( options ) { 
	
			return this.each( function() {
				if ( options ) { // Check if there an extended options for settings
					$.extend( settings, options ); // Extend the settings' attributes value or override it  
					methods.reinitializeEndOfSection();
				}
				 
				methods.init(); // Initialize the photo gallery
				if ( settings.galleryViewMode == "thumbnailList") {
					methods.switchToThumbnailView();	
				} else {
					methods.switchToFilmstripView();
				}
				
			});
			
		};
		
	})(jQuery);
} catch( err ) {
	console.error( err );
}
