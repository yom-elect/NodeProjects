array = [1,2,3,4,5,7]
array1 = [2,4,5,6,8,7]

arr_obj= {}


for ele in array:
    arr_obj[ele]=ele


for pro in array1:
    if (arr_obj[pro]):
        print(pro)

print(arr_obj[pro])