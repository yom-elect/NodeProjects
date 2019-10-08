import inspect
array = [1,2,3,4,5,6,7,11]
array1 = [2,4,5,6,7,8,10,11,12]

array_obj = {}
for ele in array:
    array_obj[ele]=ele

arr =  [pro for pro in array1 if array_obj.get(pro)]
print(arr)

for pro in array1:

    if(array_obj.get(pro)):
        print(pro)
    

lines = inspect.getsource()
print(lines)