/** Convert an emoji to a valid data url to include in a <link/> element */
export const getIconHref = (emoji: string): string => `data:image/svg+xml,
<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22>
  <text y=%22.9em%22 font-size=%2290%22>${emoji}</text>
</svg>`;


export const getFaviconEl = (): HTMLLinkElement => document.getElementById("favicon") as HTMLLinkElement;


export const setFavicon = (emoji: string) => {
   getFaviconEl().href = getIconHref(emoji);
}


export const getTitle = (): HTMLTitleElement => document.getElementById("title") as HTMLTitleElement;


export const setTitle = (title: string): void => {
    getTitle().text = title;
}

