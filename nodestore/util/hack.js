
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
            magazine.splice(magazine.indexOf(pro),0,1)
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