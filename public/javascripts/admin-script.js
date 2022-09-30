//ADD COUPON
function addCoupon(event){
    name = document.getElementById('name').value
    discount = document.getElementById('discount').value
    code = document.getElementById('code').value
if(!name==null||!discount==null||!code==null){
    $.ajax({
        url:'/admin/added-coupon',
        method:'post',
        data:{
            name:name,
            discount:discount,
            code:code
        },
        success:(response)=>{
            // setTimeout(() => {
                    swal("Coupon added successfully", "", "success");
            // },800);
        },
        error:(err)=>{
            // setTimeout(() => {
                    swal("Something went wrong", "", "warning");
            // },800);
        }
    })
}
}

//UPDATE COUPON
function updateCoupon(ID){
    name = document.getElementById('name').value
    code = document.getElementById('code').value
    discount = document.getElementById('discount').value
 if(!name==null||!code==null||!discount==null){
    $.ajax({
        url: '/admin/update-coupon/'+ID,
        method: 'post',
        data: {
            name:name,
            code:code,
            discount:discount
        },success:(response)=>{
            swal("Coupon edited successfully", "", "success");
        },error:(err)=>{
            swal("Something went wrong! Try again.", "", "warning");
        }
    })
 }
}

//DELETE COUPON
function deleteCoupon(ID){
    // console.log('deletecoupon');
    swal({
        title: "Are you sure?",
        text: "Do you really want to delete this coupon?",
        icon: "warning",
        buttons: true,
        dangerMode: true, 
      })
      .then((willRemove) => {
        if (willRemove) {
            $.ajax({
            url:'/admin/delete-coupon/'+ID,
            method:'get',
            success:(response)=>{
                swal("Coupon deleted!", "", "success");
                 $("#coupons").load(location.href + " #coupons"); 
            }
        })
        }
      });
}

//CANCEL ORDER
function cancelOrder(orderID){
    swal({
        title: "Are you sure?",
        text: "Do you really want to cancel this order?",
        icon: "warning",
        buttons: true,
        dangerMode: true, 
      })
      .then((willRemove) => {
        if (willRemove) {
            $.ajax({
                url:'/admin/cancel-order/'+orderID,
                method:'get',
                success:(response)=>{
                    swal("Order Cancelled!", "", "success");
                    $("#orders").load(location.href + " #orders"); 
                },
                error:(err)=>{
                    console.log(err);
                    swal("Something went wrong", "", "warning");
                }
        })
        }
      });
}

//PACK ORDERS
function packOrder(orderID){
    $.ajax({
        url:'/admin/pack-order/'+orderID,
        method:'get',
        success:(response)=>{
            $("#Orders").load(location.href + " #Orders"); 
        },error:(err)=>{
            console.log(err);
        }
    })
}

//SHIP ORDERS
function shipOrder(orderID){
    $.ajax({
        url:'/admin/ship-order/'+orderID,
        method:'get',
        success:(response)=>{
            $("#Orders").load(location.href + " #Orders"); 
        },error:(err)=>{
            console.log(err);
        }
    })
}

//SHIP ORDERS
function deliverOrder(orderID,userID){
    $.ajax({
        url:'/admin/deliver-order/'+orderID+'/'+userID,
        method:'get',
        success:(response)=>{
            $("#Orders").load(location.href + " #Orders"); 
        },error:(err)=>{
            console.log(err);
        }
    })
}

//DELETE PRODUCT
function deleteProduct(ID){
    swal({
        title: "Are you sure?",
        text: "Do you really want to delete this product?",
        icon: "warning",
        buttons: true,
        dangerMode: true, 
      })
      .then((willRemove) => {
        if (willRemove) {
            $.ajax({
                url:'/admin/deleteProduct/'+ID,
                method:'get',
                success:(response)=>{
                    swal("Product deleted successfully!", "", "success");
                    $("#products").load(location.href + " #products"); 
                },
                error:(err)=>{
                    console.log(err);
                    swal("Something went wrong", "", "warning");
                }
        })
        }
      });
}

//UPDATE PRODUCT
// function updateProduct(){
//     name = document.getElementById('name').value
//     brand = document.getElementById('brand').value
//     details = document.getElementById('details').value
//     description = document.getElementById('description').value
//     category = document.getElementById('category').value
//     quantity = document.getElementById('quantity').value
//     actualPrice = document.getElementById('actualPrice').value
//     sellingPrice = document.getElementById('sellingPrice').value
    
//     $.ajax({
//         url:'/admin/productEdited/',
//         method:'post',
//         data:
//         ,
//         success:(response)=>{
//             swal("Product deleted successfully!", "", "success");
//             $("#products").load(location.href + " #products"); 
//         },
//         error:(err)=>{
//             console.log(err);
//             swal("Something went wrong", "", "warning");
//         }
// })
// }

//BLOCK USER
function blockUser(id){
    swal({
        title: "Are you sure?",
        text: "Do you want to block this user?",
        icon: "warning",
        buttons: true,
        dangerMode: true, 
      })
      .then((willBlock) => {
        if (willBlock) {
            $.ajax({
                url:'/admin/block/'+id,
                method:'get',
                success:(response)=>{
                    swal("User blocked!", "", "success");
                    $("#users").load(location.href + " #users"); 
                },
                error:(err)=>{
                    console.log(err);
                    swal("Something went wrong", "", "warning");
                }
        })
        }
      });
}

//UNBLOCK USER
function unblockUser(id){
    swal({
        title: "Are you sure?",
        text: "Do you want to unblock this user?",
        icon: "warning",
        buttons: true,
        dangerMode: true, 
      })
      .then((willUnblock) => {
        if (willUnblock) {
            $.ajax({
                url:'/admin/unblock/'+id,
                method:'get',
                success:(response)=>{
                    swal("User unblocked!", "", "success");
                    $("#users").load(location.href + " #users"); 
                },
                error:(err)=>{
                    console.log(err);
                    swal("Something went wrong", "", "warning");
                }
        })
        }
      });
}

//DELETE CATEGORY
function deleteCategory(id){
    swal({
        title: "Are you sure?",
        text: "Do you want to delete this category?",
        icon: "warning",
        buttons: true,
        dangerMode: true, 
      })
      .then((willDelete) => {
        if (willDelete) {
            $.ajax({
                url:'/admin/delete-category/'+id,
                method:'get',
                success:(response)=>{
                    swal("Category deleted!", "", "success");
                    $("#category").load(location.href + " #category"); 
                },
                error:(err)=>{
                    console.log(err);
                    swal("Something went wrong", "", "warning");
                }
        })
        }
      });
}