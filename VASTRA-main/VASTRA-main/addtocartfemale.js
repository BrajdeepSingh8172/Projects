const product = [
    {
        id: 0,
        image: 'images/73.jpg',
        title: 'Dress',
        price: 4200,
    },
    {
        id: 1,
        image: 'images/72.jpg',
        title: 'Dress',
        price: 1600,
    },
    {
        id: 2,
        image: 'images/71.jpg',
        title: 'Dress',
        price: 2300,
    },
    {
        id: 3,
        image: 'images/70.jpg',
        title: 'Dress',
        price: 2000,
    },
    {
        id: 4,
        image: 'images/69.jpg',
        title: 'Dress',
        price: 3800,
    },    {
        id: 5,
        image: 'images/68.jpg',
        title: 'Dress',
        price: 3000,
    }
    ,    {
        id: 6,
        image: 'images/67.jpg',
        title: 'Dress',
        price: 4000,
    }
    ,    {
        id: 7,
        image: 'images/66.jpg',
        title: 'Dress',
        price: 2000,
    },
    {
        id: 6,
        image: 'images/65.jpg',
        title: 'Dress',
        price: 2600,
    }
    ,    {
        id: 7,
        image: 'images/60.jpg',
        title: 'Dress',
        price: 800,
    } ,{
        id: 6,
        image: 'images/64.jpg',
        title: 'Dress',
        price: 2900,
    }
    ,    {
        id: 7,
        image: 'images/60.jpg',
        title: 'Dress',
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
        document.getElementById("total").innerHTML = "$ "+0+".00";
    }
    else{
        document.getElementById("cartItem").innerHTML = cart.map((items)=>
        {
            var {image, title, price} = items;
            total=total+price;
            document.getElementById("total").innerHTML = " "+total+".00";
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
