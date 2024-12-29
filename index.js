var express=require('express');
var app=express();

// mysql connection
var mysql=require('mysql');
var conn=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'backendmodule',
    port:'3306'
})
conn.connect((err)=>{
    console.log(err);
})

// promised based execution
var util=require('util');
var exe=util.promisify(conn.query).bind(conn);


//static file serve
app.use(express.static('public/'));

//file uploading 
var upload= require('express-fileupload');
app.use(upload());


//home page
app.get('/',async(req,res)=>{
    var sql = `select* from carddata`;
    var data1 = await exe(sql);
    const obj = {data:data1};
    res.render('home.ejs',obj);
})


//add cart on admin panel
app.get('/add_card',(req,res)=>{
    res.render('addCard.ejs');
})


//Create insert
app.post('/saveCard',async(req,res)=>{
    var cardImg="";
    if(req.files)
    {
       if(req.files.card_image)
       {
           var file = req.files.card_image;
           var filename = new Date().getTime() + '_' + file.name;
           file.mv('public/uploads/' + filename);
           cardImg = filename;
       }
    }

    const {card_title,card_caption}=req.body;
    var sql =  `insert into carddata(cardName,cardCaption,cardImg) values('${card_title}','${card_caption}','${cardImg}')`;
    await exe(sql);
    // res.send(cardImg);
    res.redirect('/admin');
})




//Read admin panel
app.get('/admin',async(req,res)=>{
    var sql='select* from carddata';
    var data1=await exe(sql);
    const obj={data:data1};
    res.render('adminPanel.ejs',obj);
})



//delete 
app.get('/delete/:id',async(req,res)=>{
    var id=req.params.id;
    var sql=`delete from carddata where cardId='${id}'`;
    await exe(sql);
    // res.send('Deleted');
    res.redirect('/admin');
})



// update
app.get('/edit/:id',async(req,res)=>{
    var id=req.params.id;
    var sql=`select* from carddata where cardId='${id}'`;
    var data=await exe(sql);
    const obj={data:data[0]};
    res.render('editdata.ejs',obj);
})
app.post('/updateCard',async(req,res)=>{
    const {card_Id,card_name,card_caption}=req.body;
    if(req.files)
    {
        var file=req.files.card_img;
        var filename=new Date().getTime()+'_'+file.name;
        file.mv('public/uploads/'+filename);
        var sql=`update carddata set cardImg='${filename}' where cardId='${card_Id}'`;
        await exe(sql);
        // res.send(sql);
    }
    var sql=`update carddata set cardName='${card_name}', cardCaption='${card_caption}' where cardId='${card_Id}'`;
    await exe(sql);
    res.redirect('/admin');
})



//server start
var port=3000 || process.env.PORT;
app.listen(port,()=>{
    console.log("Server is running")
})