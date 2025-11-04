const product = [
    {
        id: 0,
        image: 'images/80.jpg',
        title: 'shirt',
        price: 1200,
    },
    {
        id: 1,
        image: 'images/81.jpg',
        title: 'orange tshirt',
        price: 600,
    },
    {
        id: 2,
        image: 'images/82.jpg',
        title: 'Blue cap',
        price: 1000,
    },
    {
        id: 3,
        image: 'images/83.jpg',
        title: 'Checkered Design Shirt',
        price: 1000,
    },
    {
        id: 4,
        image: 'images/84.jpg',
        title: 'Leather jacket',
        price: 1800,
    },    {
        id: 5,
        image: 'images/48.jpg',
        title: 'Denim jacket',
        price: 100,
    }
    ,    {
        id: 6,
        image: 'images/47.jpg',
        title: 'white full Tshirt',
        price: 1800,
    }
    ,    {
        id: 7,
        image: 'images/46.jpg',
        title: 'Black hoodie',
        price: 1000,
    },
    {
        id: 6,
        image: 'images/79.jpg',
        title: 'White half Tshirt',
        price: 1600,
    }
    ,    {
        id: 7,
        image: 'images/78.jpg',
        title: 'Sweater',
        price: 800
    } ,{
        id: 6,
        image: 'images/77.jpg',
        title: 'orange tshirt',
        price: 600,
    }
    ,    {
        id: 7,
        image: 'images/76.jpg',
        title: 'half Tshirt with shorts',
        price: 2800,
    }
];
const categories = [...new Set(product.map((item)=>
    {return item}))]
    let i=0;
document.getElementById('root').innerHTML = categories.map((item)=>
{
    var {image, title, price} = item;
    return(
        `<div class='box'>
            <div class='img-box'>
                <img class='images' src=${image}></img>
            </div>
        <div class='bottom'>
        <p>${title}</p>
        <h2> ${price}.00</h2>`+
        "<button onclick='addtocart("+(i++)+")'>Add to cart</button>"+
        `</div>
        </div>`
    )
}).join('')

var cart =[];

function addtocart(a){
    cart.push({...categories[a]});
    displaycart();
}
function delElement(a){
    cart.splice(a, 1);
    displaycart();
}

function displaycart(){
    let j = 0, total=0;
    document.getElementById("count").innerHTML=cart.length;
    if(cart.length==0){
        document.getElementById('cartItem').innerHTML = "Your cart is empty";
        document.getElementById("total").innerHTML = " "+0+".00";
    }
    else{
        document.getElementById("cartItem").innerHTML = cart.map((items)=>
        {
            var {image, title, price} = items;
            total=total+price;
            document.getElementById("total").innerHTML = "$ "+total+".00";
            return(
                `<div class='cart-item'>
                <div class='row-img'>
                    <img class='rowimg' src=${image}>
                </div>
                <p style='font-size:12px;'>${title}</p>
                <h2 style='font-size: 15px;'> ${price}.00</h2>`+
                "<i class='fa-solid fa-trash' onclick='delElement("+ (j++) +")'></i></div>"
            );
        }).join('');
    }

    
}
