import React from 'react'
import { SocialIconName, SocialLinkContent } from '../data/content'
import { Github, Linkedin, Briefcase } from 'lucide-react'
import Link from 'next/link'

const iconMap: Record<SocialIconName, React.ReactNode> = {
  github: <Github className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />,
  briefcase: <Briefcase className="h-5 w-5" />,
}

const Icons = () => {
  return (
    <div className="flex items-center justify-center gap-4">
      {SocialLinkContent.map((link) => (
        <Link href={link.url} target="_blank" key={link.name} className="flex items-center gap-2 text-inherit no-underline hover:opacity-80">
          <span>{iconMap[link.icon]}</span>
          <span className="capitalize">{link.name}</span>
        </Link>
      ))}
    </div>
  )
}

export default Icons