var sidebarTemplate = `
<div class="md-margin-bottom-40 hidden-xs">

<!--upload file-->
<input style="display: none" name="imglogo" type="file" id="loadThumbnailImageProfile" onchange="loadProfileImage()">

 <div class="img-thumbnail-container">
  <img class="img-responsive img-thumbnail profile-img margin-bottom-20" src="{{avatar}}" alt="" id="imgBox">
   <div class="img-thumbnail-update" onclick="openBrowseFile()">       
       <div class="thumbnail-logo"><a class="pull-right" href="#"><i class="fa fa-camera-retro"></i></a></div>
       <div class="thumbnail-message"><a data-i18n="profile.photo" class="pull-right" href="#"><i class="fa fa-camera-retro"></i></a></div>             
   </div>  
         
 </div>
  
  
  

  <ul class="list-group sidebar-nav-v1 margin-bottom-40" id="sidebar-nav-1">
      <li class="list-group-item active">
          <a href="{{profilePage}}"><i class="fa fa-bar-chart-o"></i> Menu</a>
      </li>
      
      <!--{{#if isSupplier}}-->
      <!--<li class="list-group-item">-->
          <!--<a href="page_catalog.html?idSupplier={{idSupplier}}"><i class="fa fa-book"></i> <span data-i18n="catalog.mycatalog"></span></a>-->
      <!--</li>-->
      <!--<li class="list-group-item">-->
          <!--<a href="page_product_new.html"><i class="fa fa-plus"></i> <span data-i18n="product.newProduct"></span></a>-->
      <!--</li>-->
      <!---->
      <!--{{else}}-->
      <!--<li class="list-group-item">-->
          <!--<a href="page_profile_settings.html?tab=favoriteTab"><i class="fa fa-star"></i> <span data-i18n="profile.favoriteSuppliers"></span></a>-->
      <!--</li>      -->
      <!--{{/if}}-->

      <!--<li class="list-group-item">-->
          <!--<a href="page_rfq_inbox.html"><i class="fa fa-paper-plane"></i><span data-i18n="rfq.myrfqs"></span> </a>-->
      <!--</li>-->

      <li class="list-group-item">
          <a href="{{profilePage}}"><i class="fa fa-cog"></i> <span data-i18n="profile.profile"></span></a>
      </li>
  </ul>

</div>
`;
