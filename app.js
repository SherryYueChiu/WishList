var baseUrl = "https://sherryyuechiu.github.io/WishList/";

var $enterBox = document.querySelector(".enterBox");
var $signinBox = document.querySelector(".signinBox");
var $signupBox = document.querySelector(".signupBox");
var $infoBox = document.querySelector(".infoBox");
var $viewBox = document.querySelector(".viewBox");

var $signin = document.querySelector("#signin");
var $signup = document.querySelector("#signup");
var $backToEnter = document.querySelectorAll(".backToEnter");

var $signinBtn = document.querySelector("#signin_submit");
var $signupBtn = document.querySelector("#signup_submit");
var $signin_account = document.querySelector("#signin_account");
var $signin_pswd = document.querySelector("#signin_pswd");
var $signup_account = document.querySelector("#signup_account");
var $signup_pswd = document.querySelector("#signup_pswd");
var $signup_name = document.querySelector("#signup_name");

//in editor
var $info_name = document.querySelector("#myname");
var $memo = document.querySelector("#memo");

var $wishList = document.querySelector("#wishList");
var $appendNew = document.querySelector("#appendNew");
var $info_update = document.querySelector("#info_update");
var $share = document.querySelector("#share");

//view other
var $theirName = document.querySelector(".viewBox .name");
var $theirMemo = document.querySelector(".viewBox .memo");
var $theirList = document.querySelector(".viewBox .wishList");

var db = firebase.database();

var viewOther = function () {
  let url = window.location.href || document.URL;
  url = new URL(url);
  view = url.searchParams.get("view") ?? null;
  if (!view){
    $viewBox.style.display = "none";
    return;
  }
  //restore infomation
  getData(`users/${view}`, null, (valid) => {
    if (!valid) return;
    getData(`users/${view}/name`, null, (name) => { $theirName.innerHTML = name ?? "" });
    getData(`users/${view}/memo`, null, (memo) => { $theirMemo.innerHTML = memo ?? "" });
    getData(`users/${view}/wishList`, null, (wishList) => {
      gifts = wishList.split(" || ");
      for (let each in gifts) {
        gifts[each] = gifts[each].split(" && ");
        $theirList.insertAdjacentHTML('afterbegin', `
     <li>
       <ul class="gift">
         <div class="item">${gifts[each][0] ?? ""}</div>
         <div class="link" onclick="window.open('${gifts[each][1] ?? ""}')">${gifts[each][1] ? "<i class='fas fa-external-link-alt'></i>" : "<i class='far fa-smile-wink'></i>"}</div>
       </ul>
     </li>
       `);
      }
    });
  });
}

var restoreWishList = function (uid) {
  getData(`users/${uid}/wishList`, null, (wishList) => {
    gifts = wishList.split(" || ");
    for (let each in gifts) {
      gifts[each] = gifts[each].split(" && ");
      $wishList.insertAdjacentHTML('afterbegin', `
<li>
  <ul class="gift">
    <input value="${gifts[each][0] ?? ""}" placeholder="??????">
    <input value="${gifts[each][1] ?? ""}" placeholder="??????">
    <div class="delLine"><i class="fas fa-times"></i></div>
  </ul>
</li>
  `);
    }
    deleteLineEvtBind();
  });
}

var fillName = function (uid) {
  getData(`users/${uid}/name`, null, (name) => { $info_name.value = name });
}

var restoreMemo = function (uid) {
  getData(`users/${uid}/memo`, null, (memo) => {
    $memo.value = memo;
    localStorage.setItem("memo", memo);
  });
}

var getData = function (ref, variable = null, callback = null) {
  if (!ref) return null;
  let data;
  db.ref(ref).once('value', function (snapshot) {
    data = snapshot.val();
    console.log(`Got ${ref}: ${data}`);
    if (variable) {
      variable = data;
    }
    if (callback) {
      callback(data);
    }
  });
}

//register a new account
var register = function (uid, pswd, name) {
  if (!uid || !pswd || !name) return false;
  var accountInfo = {
    pswd: pswd,
    name: name,
    memo: "????????????????????????????????????????????????"
  }

  db.ref(`users/${uid}`).once('value', function (snapshot) {
    let uidAvailable = !(snapshot.val());
    if (uidAvailable) {
      db.ref(`/users/${uid}`)
        .update(accountInfo)
        .then(function () {
          localStorage.setItem("uid", uid);
          localStorage.setItem("pswd", pswd);
          toastr.clear();
          toastr.success('???????????????');
          $infoBox.style.display = "flex";
          $signupBox.style.display = "none";
          fillName(uid);
          console.log(`user ${uid} has signed up.`);
          //put infomation on table
          getData(`users/${uid}/name`, null, (name) => { localStorage.setItem("name", name) });
          restoreWishList(uid);
          restoreMemo(uid);
        });
    } else {
      toastr.error('???????????????');
      console.log(`sign up failed.`);
    }
  });
}

//login method
var login = function (uid, pswd) {
  if (!uid || !pswd) return;
  db.ref(`users/${uid}/pswd`).once('value', function (snapshot) {
    correctPswd = snapshot.val();
    if (correctPswd == pswd) {
      localStorage.setItem("uid", uid);
      localStorage.setItem("pswd", pswd);
      toastr.success('?????????');
      $infoBox.style.display = "flex";
      $enterBox.style.display = "none";
      $signinBox.style.display = "none";
      fillName(uid);
      console.log(`user ${uid} logged in.`);
      //put infomation on table
      getData(`users/${uid}/name`, null, (name) => { localStorage.setItem("name", name) });
      restoreMemo(uid);
      restoreWishList(uid);

    } else {
      toastr.error('???????????????????????????????????????');
      console.log(`log in failed.`);
    }
  });
}

//update partial information
var updateWishList = function (uid, newWishList) {
  if (!uid || !wishList) return false;
  var accountInfo = {
    wishList: newWishList
  }
  db.ref(`/users/${uid}`)
    .update(accountInfo)
    .then(function () {
      toastr.success('?????????????????????');
      console.log(`update wishList: ${newWishList}`);
    });
}

var updateName = function (uid, newName) {
  if (!uid || !newName) return false;
  var accountInfo = {
    name: newName
  }
  db.ref(`/users/${uid}`).update(accountInfo)
    .then(function () {
      toastr.success('???????????????');
      console.log(`update name: ${newName}`);
    });
}

var updatePswd = function (uid, newPswd) {
  if (!uid || !newPswd) return false;
  var accountInfo = {
    pswd: newPswd
  }
  db.ref(`/users/${uid}`).update(accountInfo)
    .then(function () {
      toastr.success('???????????????');
      console.log(`update pswd: ${newPswd}`);
    });
}

var updateMemo = function (uid, newMemo) {
  if (!uid || !newMemo) return false;
  var accountInfo = {
    memo: newMemo
  }
  db.ref(`/users/${uid}`).update(accountInfo)
    .then(function () {
      toastr.success('???????????????');
      console.log(`update memo: ${newMemo}`);
    });
}

$signin.addEventListener("click", () => {
  $enterBox.style.display = "none";
  $signinBox.style.display = "flex";
  $signupBox.style.display = "none";
  //hide viewbox
  $viewBox.style.display = "none";
});
$signup.addEventListener("click", () => {
  $enterBox.style.display = "none";
  $signinBox.style.display = "none";
  $signupBox.style.display = "flex";
  //hide viewbox
  $viewBox.style.display = "none";
});
$backToEnter.forEach(btn => {
  btn.addEventListener("click", () => {
    $enterBox.style.display = "block";
    $signinBox.style.display = "none";
    $signupBox.style.display = "none";
    $infoBox.style.display = "none";
    //hide viewbox
    $viewBox.style.display = "flex";
  });
});

$signinBtn.addEventListener("click", () => {
  login($signin_account.value.toLowerCase(), $signin_pswd.value);
});
$signupBtn.addEventListener("click", () => {
  register($signup_account.value.toLowerCase(), $signup_pswd.value, $signup_name.value);
});

//??????????????????
$appendNew.addEventListener("click", () => {
  if ($wishList.querySelectorAll("li").length > 10) {
    toastr.warning("?????????10??????????????????????????????");
    return;
  }
  $wishList.insertAdjacentHTML('afterbegin', `
<li>
  <ul class="gift">
    <input value="iphone12" placeholder="??????">
    <input value="https://www.apple.com/tw/shop/buy-iphone/iphone-12/" placeholder="??????">
    <div class="delLine"><i class="fas fa-times"></i></div>
  </ul>
</li>
  `);
  deleteLineEvtBind();
});

//??????????????????
var deleteLineEvtBind = function () {
  let gifts = document.querySelectorAll(".infoBox .gift");
  gifts.forEach(gift => {
    gift.querySelector(".delLine").addEventListener("click", () => {
      gift.parentNode.removeChild(gift);
    });
  });
}

//????????????
$share.addEventListener("click", () => {
  let uid = localStorage.getItem("uid");
  let name = localStorage.getItem("name");
  if (navigator.share) {
    navigator.share({
      title: `${name}??????????????????`,
      text: '????????????????????????--????????????????????????',
      url: `${baseUrl}?view=${uid}`,
    })
      .then(() => console.log('????????????'))
      .catch((error) => {
        location.href = `${baseUrl}?view=${uid}`;
        console.log('????????????', error);
      });
  } else {
    location.href = `${baseUrl}?view=${uid}`;
  }
});

//????????????
$info_update.addEventListener("click", () => {
  let uid = localStorage.getItem("uid");
  if ($info_update.getAttribute("disable") == "true") return;

  gifts = document.querySelectorAll(".infoBox .gift");
  let wishList = "";
  gifts.forEach(gift => {
    let item = gift.querySelectorAll("input")[0].value ?? "";
    let link = gift.querySelectorAll("input")[1].value ?? "";
    wishList += ` || ${item} && ${link}`;
  });
  wishList = wishList.substr(4).replaceAll(" ||  && ", "");

  //update to firebase
  var accountInfo = {};
  accountInfo.wishList = wishList;
  if (localStorage.getItem("memo") != $memo.value) {
    accountInfo.memo = $memo.value;
  }
  if (localStorage.getItem("name") != $info_name.value) {
    accountInfo.name = $info_name.value;
  }
  db.ref(`/users/${uid}`).update(accountInfo)
    .then(function () {
      toastr.success('?????????');
      console.log(`update wishList: ${wishList}`);
    });
  //debounce time: 2s
  $info_update.setAttribute("disable", "true")
  setTimeout(() => { $info_update.setAttribute("disable", "") }, 2000)
});

//auto login
autoLogin = function () {
  let uid = localStorage.getItem("uid") ?? "";
  let pswd = localStorage.getItem("pswd") ?? "";
  login(uid, pswd);
}
//if (!!localStorage.getItem("uid"))  autoLogin();

  //view other
  viewOther();

//toastr
toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": true,
  "positionClass": "toast-bottom-center",
  "preventDuplicates": true,
  "onclick": null,
  "showDuration": "3000",
  "hideDuration": "1000",
  "timeOut": "4000",
  "extendedTimeOut": "4000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
}
