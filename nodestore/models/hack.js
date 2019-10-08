// let arr1 = ['a','b','c','d','e','f']
// let arr2 = ['a','c','d','e']

// let len1 =  arr1.length
// let arr_obj = {} 

//  // var arr2 = arr.filter(function(item,index){
//  //            if(ind.indexOf(index)== -1){
//  //            return true;
// // arr2.forEach(ele=>{
// // 	arr_obj[ele] = ele
// // })

// // arr1.forEach(pro=>{
// // 	if (arr_obj[pro]){
// // 		arr1.
// // 	}
// // })

// // let result = len1 - arr1.length
// //     if (result === arr2.length) {
// //        console.log('Yes')
// //     } else {
// //        console.log('No')
// //    }

arr = [0,1,2,0,3,4,0,5,0]
let result 
// Complete the checkMagazine function below.
function checkMagazine(magazine, note) {
    let mag_length = magazine.length 
    let arr_obj = {}

    note.forEach(ele => {
       arr_obj[ele]= ele
    })
   
    magazine.forEach(pro => {
        if (arr_obj[pro]) {
            magazine.splice(magazine.indexOf(pro),1,0)
        }
    })
   let newar = []
    magazine.forEach(ele => {
        if (ele !== 0) {
           newar.push(ele)
       }
    })
    let result = mag_length - newar.length
    if (result === note.length) {
       console.log('Yes')
    } else {
       console.log('No')
   }
}