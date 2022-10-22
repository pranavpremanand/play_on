// const { response } = require("../../app");
//SHOW COUNT OF CART ITEMS & ADD PRODUCT TO CART
function addToCart(prodID) {
  $.ajax({
    url: "/addToCart/" + prodID,
    method: "get",
    success: (response) => {
      // console.log(response);
      if(response.outOfStock){
        swal("Out of Stock!", "", "warning",{buttons:false,timer:800});
      }else{
      $("#checkout_items").html(response.countOfItems);
      swal("Item added to Cart!", "", "success",{
        buttons:false, timer:800
      });
      // $("#products").load(location.href + " #products");
    }
    },
    error: (err) => {},
  });
}

//REMOVE FROM CART
function removeFromCart(prodId) {
  swal({
    title: "Are you sure?",
    text: "Do you really want to remove the item?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((willRemove) => {
    if (willRemove) {
      $.ajax({
        url: "/removeFromCart/" + prodId,
        method: "get",
        success: (response) => {
          swal("Item removed from Cart!", "", "success",{
            buttons:false,timer:800});
          // setTimeout(() => {
            // $("#products").load(location.href + " #products");
            // $("#total-cost").load(location.href + " #total-cost");
            location.reload();
          // }, 800);
        },
      });
    }
  });
}

//CHANGE QUANTITY
function changeQuantity(pdtID, userID, count) {
  // let quantity= document.getElementById('product'+pdtID).innerHTML
  // console.log(quantity,'ghdf');
  // if(Count>1){
  // console.log("api call");
  $.ajax({
    url: "/changeQuantity",
    data: {
      product: pdtID,
      user: userID,
      count: count,
    },
    method: "post",
    success: (response) => {
      console.log(response);
      console.log(pdtID);
      //  document.getElementById('product'+pdtID).innerHTML = response;
      // location.reload();
      $("#products").load(location.href + " #products");
    },
  });
  // }
}

//COUNT OF CART ITEMS
// document.addEventListener('DOMContentLoaded',count);
// 		function count(){
// 			// console.log('sdsdsdsdsdsdsd')
// 		axios({
// 							method: "get",
// 							url: "/count"

// 							})
// 							.then(function (response) {
// 								//handle success`a
// 								// console.log(response.data)
//                                 // if(response.data === 0){
//                                 //     const data = document.getElementById("cart-items")
//                                 //     data.style.visibility = 'hidden'
//                                 // }
//                                 // else{
//                                     document.getElementById("cart-items").innerHTML = response.data
//                                 // }
// 								console.log('success');
// 							})
// 							.catch(function (response) {
// 								//handle error
// 								// console.log('error');
// 							});
// 		}

// TOTAL COST OF CART ITEMS
function costOfCartItems(){
	$.ajax({
		url:'/costOfCartItems',
		method:'get',
		success: (response)=>{
            $("#total-cost").html(response)
            // $(".products").load(location.href + " .products");
		},

	})
	}


document.addEventListener("click", costOfCartItems);
function costOfCartItems() {
  // console.log('sdsdsdsdsdsdsd')
  axios({
    method: "get",
    url: "/costOfCartItems",
  })
    .then(function (response) {
      //handle success
      console.log(response);
      document.getElementById("total-cost").innerHTML = response.data;
      console.log("Success");
    })
    .catch(function (response) {
      //handle error
      // console.log('Error');
    });
}

//ADD ITEM TO WISHLIST
function addToWishlist(productID) {
  $.ajax({
    url: "/addToWishlist/" + productID,
    method: "get",
    success: (response) => {
      if (response.removed) {
        console.log("success");
        swal("Item removed from Wishlist!", "", "success",{
          buttons:false,timer:800});
      } else {
        console.log("success");
        // document.getElementById('wishlist-icon').style.backgroundColor = 'Red'
        swal("Item added to Wishlist!", "", "success",{
          buttons:false,timer:800});
      }
    },
  });
}

//REMOVE FROM WISHLIST
function removeFromWishlist(prodId) {
  swal({
    title: "Are you sure?",
    text: "Do you really want to remove the item?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((willRemove) => {
    if (willRemove) {
      $.ajax({
        url: "/removeFromWishlist/" + prodId,
        method: "get",
        success: (response) => {
          swal("Item removed from Wishlist!", "", "success",{
            buttons:false,timer:800});
          $("#products").load(location.href + " #products");
        },
      });
    }
  });
}

//REMOVE ADDRESS
function deleteAddress(addressID) {
  swal({
    title: "Are you sure?",
    text: "Do you really want to delete the address?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((willRemove) => {
    if (willRemove) {
      $.ajax({
        url: "/delete-address/" + addressID,
        method: "get",
        success: (response) => {
          $("#addresses").load(location.href + " #addresses");
          // location.reload();
        },
      });
    }
  });
}

//UPDATE PASSWORD
// $(()=>{
//     $('#submitbuttons').click(function(ev){
//         const form = $('#passwordForm')
//         const url = form.attr('/update-password')
//         $.ajax({
//             type:'post',
//             url:url,
//             data:form.serialize(),
//             success:function(data){
//                 alert('submitted')
//             },error: function(data){
//                 alert('error')
//             }
//         })
//     })
// })

function updatePassword(ID) {
  console.log("hello there");
  currentPassword = document.getElementById("currentPassword").value;
  newPassword = document.getElementById("newPassword").value;
  repeatPassword = document.getElementById("repeatPassword").value;

  if(!currentPassword == null||!newPassword == null||!repeatPassword == null){
    $.ajax({
      url: "/update-password",
      data: {
        currentPassword: currentPassword,
        newPassword: newPassword,
        repeatPassword: repeatPassword,
        ID: ID,
      },
      method: "post",
      success: (response) => {
        console.log(response);
        console.log("response");
        if (response.data.success) {
          swal("Password updated!", "", "success",{
            buttons:false,timer:800});
        } else if (response.data.repeatIncorrect) {
          swal("Re-entered password is incorrect!", "", "danger",{
            buttons:false,timer:800});
        } else if (response.data.oldIncorrect) {
          swal("Current password is incorrect!", "", "warning",{
            buttons:false,timer:800});
        }
        //  document.getElementById('product'+pdtID).innerHTML = response;
        // location.reload();
        // $("#products").load(location.href + " #products");
      },
      error: (err) => {
        console.log("err");
      },
    });
  }
}

//UPDATE ADDRESS
function updateAddress(ID) {
  console.log("updating address");
  fullName = document.getElementById("fullName").value;
  mobile = document.getElementById("mobile").value;
  pincode = document.getElementById("pincode").value;
  building = document.getElementById("building").value;
  area = document.getElementById("area").value;
  landmark = document.getElementById("landmark").value;
  district = document.getElementById("district").value;

  if(!fullName == null||!mobile == null ||
    !pincode==null || !building==null || 
    !area==null || !landmark==null || 
    !disctrict==null){
      $.ajax({
        url: "/edited-address/" + ID,
        method: "post",
        data: {
          fullName: fullName,
          mobile: mobile,
          pincode: pincode,
          building: building,
          area: area,
          landmark: landmark,
          district: district,
        },
        success: (response) => {
          swal("Address updated!", "", "success",{buttons:false,timer:800});
        },
        error: (err) => swal("Something went wrong!", "", "warning",{
          buttons:false,timer:800}),
      });
    }
}

//UPDATE USER DATA

// function updateUser(ID)
$('#editProfile').submit(function(event){
  event.preventDefault()
  // {
    // $(document).ready(function () {
    //     $("form").submit(function (event) {
    const name = document.getElementById("name").value;
    // phoneNumber = document.getElementById('phoneNumber').value
    const email = document.getElementById("email").value;
    $.ajax({
      url: "/update-profile",
      method: "post",
      data: {
        name: name,
        email: email,
      },
      success: (response) => {
        // console.log(response);
        // document.getElementById('email').value = response.updatedData.email
        // document.getElementById('name').value = response.updatedData.name
        // location.reload()
        swal("Profile updated!", "", "success",{
          buttons:false});
      },
      error: (err) => swal("Something went wrong!", "", "warning",{
        buttons:false,timer:800}),
    });
    // event.preventDefault();
    // })  })
  // }
})


//APPLY COUPON
function applyCoupon() {
  couponCode = document.getElementById("coupon").value;
  amount = document.getElementById("total-cost").innerHTML;
  console.log(couponCode);
  $.ajax({
    url: "/apply-coupon",
    method: "post",
    data: {
      coupon: couponCode,
      amount: amount,
    },
    success: (response) => {
      console.log(response);
      if (response.status) {
        swal("Coupon applied!", "", "success",{
          buttons:false});
        document.getElementById("discount").value = response.discount;
        document.getElementById("discountAmt").innerHTML = response.discount;
        document.getElementById("finalCost").innerHTML = response.finalAmount;
        document.getElementById("final-cost").value = response.finalAmount;
      } else {
        swal("Enter a valid coupon code!", "", "warning",{
          buttons:false,timer:800});
      }
    },
  });
}

//PLACE ORDER
// document.addEventListener("click", placeOrder);

function selectAddress(id){
  document.getElementById('address').value = id
  document.getElementById('addressId').value = id
}

function placeOrder() {
  totalCost = document.getElementById("totalCost").value;
  coupon = document.getElementById("coupon").value;
  discount = document.getElementById("discount").value;
  finalCost = document.getElementById("final-cost").value;
  paymentMethod = document.getElementById("paymentMethod").value;
  address = document.getElementById("addressId").value;
  console.log(address)
  if(!address){
    swal("Select an address!", "", "warning",{
      buttons:false,timer:800});
  }
  else{
  $.ajax({
    url: "/place-order",
    method: "post",
    data: {
      totalCost: totalCost,
      coupon: coupon,
      discount: discount,
      finalCost: finalCost,
      paymentMethod: paymentMethod,
      address: address,
    },success:(response) => {
      if(response.CODstatus){
        location.href = '/ordersuccess/'+response.id
      }else{
        console.log("payment");
        razorpayPayment(response);
        // req.session.orderID = response.receipt
      }
    },error:(err) => {
      console.log(err);
      console.log("Error found");
    }
})
}
}


function razorpayPayment(order) {
  console.log('razorpay paymentaaaaaaa')
  console.log(order)
  let options = {
    key: "rzp_test_scEepl97MNpDhh", // Enter the Key ID generated from the Dashboard
    amount: order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
    currency: "INR",
    name: "Play On",
    description: "Transaction",
    image: "https://example.com/your_logo",
    order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
    handler: function (response) {
      console.log('helllllllllllllooooooooooo')
      // alert(response.razorpay_order_id);
    //   alert(response.razorpay_signature);
      verifyPayment(response, order);
    },
    prefill: {
      name: "Test name",
      email: "test@email.com",
      contact: "9999999999",
    },
    notes: {
      address: "Razorpay Corporate Office",
    },
    theme: {
      color: "#3399cc",
    },
  };
  let rzp1 = new Razorpay(options);
  rzp1.open();

  function verifyPayment(payment, order) {
    // console.log('verifyyyyyyyyyy',payment)
    // console.log('verifyyyyyyyyyy',order)
    $.ajax({
      url: "/verify-payment",
      method: "post",
      data: {
        payment,
        order
      },success:(response)=>{
        if(response.status){
          setTimeout(() => {
            location.href = '/ordersuccess/'+order.receipt
          }, 800);
        }else{
          console.log("response.order",order.receipt)
          $.ajax({
            url: '/paymentfailed/'+response.orderID,
            method: 'get',
            success:(response)=>{
              // location.href = '/paymentfailed'
              // alert('payment       failed');
            },error:(err)=>{
              //handle error
            }
          })
        }
      },error:(err)=>{
        console.log(err);
      }
    });
  }

  rzp1.on("payment.failed", function (response) {
    $.ajax({
      url: '/paymentfailed/'+response.receipt,
      method: 'get',
      success:(response)=>{
        // location.href = '/paymentfailed'
        // console.log('payment       failed');
        // alert('payment       failed');
      }
    })

    // alert(response.error.code);
    // alert(response.error.description);
    // alert(response.error.source);
    // alert(response.error.step);
    // alert(response.error.reason);
    // alert(response.error.metadata.order_id);
    // alert(response.error.metadata.payment_id);
  });
}

//CANCEL ORDER
function cancelOrder(orderID){
    swal({
        title: "Are you sure?",
        text: "Do you really want to cancel the order?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then((willRemove) => {
        if (willRemove) {
          $.ajax({
            url: "/cancel-order/" + orderID,
            method: "get",
            success: (response) => {
              // $("#addresses").load(location.href + " #addresses");
              // location.reload();
              location.href = '/view-orders'
            },
          });
        }
      });
}

//CANCEL ORDER FROM VIEW ORDERS PAGE
function CancelOrder(orderID){
  swal({
      title: "Are you sure?",
      text: "Do you really want to cancel the order?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willRemove) => {
      if (willRemove) {
        $.ajax({
          url: "/cancel-order/" + orderID,
          method: "get",
          success: (response) => {
            $("#orders").load(location.href + " #orders");
            // location.reload();
            // location.href = '/view-orders'
          },
        });
      }
    });
}