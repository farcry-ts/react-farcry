# react-farcry

React utilities for [FarCry](https://github.com/farcry-ts/farcry).

**Experimental!**

## Usage

```tsx
import { useMethod, refresh } from "react-farcry";
import { getPost, likePost } from "./rpc-client";

function Post(props: PostProps) {
  const post = useMethod(getPost, { postId: props.id });

  if (post === undefined) {
    return "Loading post...";
  }

  return (
    <div className="Post">
      <PostBody post={post} />
      <LikeButton
        liked={post.liked}
        onLike={async () => {
          await likePost({ postId: props.id });
          refresh(getPost);
        }}
      />
    </div>
  );
}
```
