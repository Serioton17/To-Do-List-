ls=[]
def add (task):
    if len(task) > 0:
     ls.append(task)
     print(f"Task '{task}' added to your TO-DO list successfully.")
    else:
       print("Please enter a valid task")

def deleting(task):
      if task in ls:
         ls.remove(task)
         print(f"The task'{task}' has been removed successfully.")
      else:
         print("Task not found enter a valid task")

def display():
    if len(ls) > 0:
        print("\nYour TO-DO list:")
        for i in range(len(ls)):
            print(f"{i+1}. {ls[i]}")
    else:
        print("Your TO-DO list is empty.")


def main():
   print("\n====TO-DO LIST====\n")
   print("1.ADD A TASK \n2.DELETE A TASK\n3.DISPLAY YOUR TO-DO LIST\n4.EXIT")
   choice = int(input("Enter your choice(1-4):"))
   if choice == 1:
      addtask =input("Enter a task to add: ")
      add(addtask)
   elif choice == 2:
      deltask = input("Enter a task to delete: ")
      deleting(deltask)
   elif choice == 3:
      display()
   elif choice == 4:
      print("Exiting the program. Goodbye!")
      exit()
   else:
      print("INVALID CHOICE!")


if __name__ == "__main__":
   while True:
      main()


