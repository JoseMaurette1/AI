export interface HeroContent {
  title: string
  subtitle: string
  description: string
  cards: CardContent[]
}

export interface CardContent {
  link?: string
  id: string
  date?: string
  title: string
  image?: string
}

export interface SocialLinks  { 
    name: string
    url: string
    icon: SocialIconName
}

export type SocialIconName = 'github' | 'linkedin' | 'briefcase'

export const SocialLinkContent: SocialLinks[] = [
    {name: 'github', url: 'https://github.com/JoseMaurette1', icon: 'github'},
    {name: 'linkedin', url: 'https://linkedin.com/in/maurette', icon: 'linkedin'},
    {name: 'portfolio', url: 'https://maurette.vercel.app', icon: 'briefcase'},
]

export const heroContent: HeroContent = {
  title: "Jose Maurette",
  subtitle: "Artificial Intelligence CAI4002",
  description: "Click on the Cards to get started",
  cards: [
    {
      link: "/search",
      id: "search",
      title: "Traditional Approach: Search",
      date: "2025-09-21",
      image: "/puzzle.png"
    },
    {
      link: "/game",
      id: "game",
      title: "Traditional Approach: Game",
      date: "2025-10-19",
      image: "/game.png"
    },
    {
      id: "data-mining",
      title: "Traditional Approach: Data Mining",
      date: "TBD...",
      image: "/mining.jpg"
    },
    {
      id: "machine-learning",
      title: "Traditional Approach: Machine Learning",
      date: "TBD...",
      image: "/machinelearning.png"
    }
  ]
}
