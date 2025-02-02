import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "./ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form"
import { Input } from "./ui/input"
import SortingHatWrapper from "./sortinghat/SortingHatWrapper"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  house: z.string().optional(),
})

interface SignupProps {
  setLoadGame: (value: boolean) => void;
}
export function SignUpForm({ setLoadGame }: SignupProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      house: "",
    },
  })

 async  function onSubmit(values: z.infer<typeof formSchema>) {
    try{
      console.log('auth::',auth);
      const userCredential = await createUserWithEmailAndPassword(auth,values.email,values.password);
      console.log('user Cred',userCredential);
      await setDoc(doc(db,"users",userCredential.user.uid),{
        username: values.username,
        email: values.email,
        house: values.house,
        createdAt: new Date()
      })
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('token',token);
      setLoadGame(true);

    }
    catch(error: unknown){
      form.setError("root",{
        message: "Sign up failed"
      })
      console.log(error);
    }
    console.log(values)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="w-full bg-[#EBDCA5] rounded-lg p-4 mb-6 h-fit">
            <SortingHatWrapper size="small" />
          </div>

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="HarryPotter" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="harry.potter@hogwarts.edu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">Create Account</Button>
        </form>
      </Form>
    </div>
  )
}