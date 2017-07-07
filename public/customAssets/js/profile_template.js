var defaultUserProfileTemplate = `
<h2 class="heading-md" data-i18n="profile.title"></h2>
<br>
<dl class="dl-horizontal">
    <dt><strong data-i18n="profile.email"></strong></dt>
    <dd>
        {{email}}
        <!-- span>
          <a class="pull-right" href="#">
            <i class="fa fa-pencil"></i>
          </a>
        </span -->
    </dd>
    <hr>
    <dt><strong data-i18n="profile.type"></strong></dt>
    <dd id="pType" data-accountType={{type}}>
        {{typeTranslate}}
    </dd>
    <hr>
    <dt><strong data-i18n="profile.Name"></strong></dt>
    <dd>
        <span data-name="name" data-i18n="[data-defaultEmptyValue]profile.emptyText" id="ed-name">{{name}}</span>
        <a class="pull-right" href="javascript:setEditable('ed-name',{{profileEditParams}})"><i class="fa fa-pencil"></i></a>
    </dd>
    <hr>
    <dt><strong data-i18n="profile.Surname"></strong></dt>
    <dd>
        <span data-name="surname" data-i18n="[data-defaultEmptyValue]profile.emptyText" id="ed-surname">{{surname}}</span>
        <a class="pull-right" href="javascript:setEditable('ed-surname',{{profileEditParams}})"><i class="fa fa-pencil"></i></a>
    </dd>
    <hr>
    <dt><strong data-i18n="profile.ckanApiKey"></strong></dt>
    <dd>
        <span data-name="ckan_apikey" data-i18n="[data-defaultEmptyValue]profile.emptyText" id="ed-ckan">{{ckan_apikey}}</span>
        <a class="pull-right" href="javascript:setEditable('ed-ckan',{{profileEditParams}})"><i class="fa fa-pencil"></i></a>
    </dd>
    <hr>
    <dt><strong data-i18n="profile.avatar"></strong></dt>
    <dd>
        <span data-name="avatar" data-i18n="[data-defaultEmptyValue]profile.emptyText" id="ed-avatar">{{avatar}}</span>
        <a id="ed-avatarButton" style="display: none" class="pull-right" onclick="setEditable('ed-avatar',{{profileEditParams}})"><i class="fa fa-pencil"></i></a>
    </dd>
    <hr>
</dl>
<button id="profileCancel" type="button" disabled class="btn-u btn-u-default" data-i18n="profile.cancel" onclick="getUserProfile()">Cancel</button>
<button id="profileSave" type="button" disabled class="btn-u btn-u-default" data-i18n="profile.save" onclick="updateProfile()">Save Changes</button>
`;


var changePasswordTemplate = `
<h2 class="heading-md" data-i18n="profile.passwordTitle"></h2>
<p data-i18n="profile.passwordTitle2"></p>
<br>
<div>
  <div class="input-group margin-bottom-20">
    <span class="input-group-addon rounded-left"><i class="icon-lock color-white"></i></span>
    <input type="password" class="form-control rounded-right" data-i18n="[placeholder]profile.oldPasswordPlaceholder" id="oldPassword">
  </div>

  <div class="input-group margin-bottom-20">
    <span class="input-group-addon rounded-left"><i class="icon-lock color-white"></i></span>
    <input type="password" class="form-control rounded-right" data-i18n="[placeholder]profile.newPasswordPlaceholder" id="newPassword1">
  </div>
  
  <div class="input-group margin-bottom-20">
    <span class="input-group-addon rounded-left"><i class="icon-lock color-white"></i></span>
    <input type="password" class="form-control rounded-right" data-i18n="[placeholder]profile.newPassword2Placeholder" id="newPassword2">
  </div>
  <hr />
  <div class="input-group margin-bottom-20">
    <button type="button" class="btn-u" data-i18n="profile.save" onclick="changePassword()"></button>
  </div>
      
</div>
`;







