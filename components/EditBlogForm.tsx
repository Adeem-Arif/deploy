'use client';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import TipTapEditor from "@/components/TipTap";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CldUploadButton } from "next-cloudinary";

type Category = "technology" | "LifeStyle" | "travel";

type blog = {
  _id: string,
  tittle: string,
  content: string,
  category: Category
  image: string
}

type Props = {
  blogId: string;
  initialData: blog;
};


export default function EditBlogForm({ blogId, initialData }: Props) {
  const [tittle, setTitle] = useState(initialData?.tittle || "");
  const [category, setCategory] = useState<Category | "">(initialData?.category || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [image, setImage] = useState<string | null>(null);

  const router = useRouter()


  const handleCategory = (value: Category) => {
    setCategory(value);
  };

  const handleSubmit = async (id: string) => {
    const formData = new FormData();
    formData.append("tittle", tittle);
    formData.append("content", content);
    formData.append("category", category);


    if (image) formData.append('image', image);
    const res = await fetch(`/api/blog/${id}`, {
      method: "PUT",
      body: formData,
    })
    if (res.status == 200) {
      router.push("/pages/dashBoard")
      toast.success("Update your blog successfully")

      setTitle("");
      setCategory("");
      setContent("");
      setImage(null)
    }
    else if (res.status == 400) {
      alert("Blog is not updated successfully")
    }
    console.log(res, "res oky")
  }



  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Blog</h1>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            onChange={(e) => setTitle(e.target.value)}
            value={tittle}
            id="title"
            placeholder="Enter blog title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select onValueChange={handleCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="LifeStyle">Lifestyle</SelectItem>
              <SelectItem value="travel">Travel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <TipTapEditor content={content} onChange={setContent} />
        </div>
        <div className="space-y-2">
          <CldUploadButton
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            onSuccess={(result: any) => {
              console.log('Upload result:', result);
              setImage(result?.info?.secure_url);
            }}
          />
        </div>

        <div className="pt-4 text-right">
          <Button type="submit" onClick={() => handleSubmit(blogId)} >
            Update Blog
          </Button>
        </div>
      </div>
    </div>
  );
}
