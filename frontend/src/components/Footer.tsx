import {Github, Twitter, Dribbble } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="text-center my-16 w-full">
      <a href="https://x.com/Fabulous_7781" target="_blank" rel="noopener noreferrer" className="inline-block w-[45px] h-[45px] rounded-full border border-dashed border-white text-white mx-1.5 hover:bg-white/10">
        <Twitter className="mt-3 mx-auto" size={20} />
      </a>
      <a href="https://github.com/himanshu-thakur-7" target="_blank" rel="noopener noreferrer" className="inline-block w-[45px] h-[45px] rounded-full border border-dashed border-white text-white mx-1.5 hover:bg-white/10">
        <Github className="mt-3 mx-auto" size={20} />
      </a>
      
    </footer>
  );
};

export default Footer;