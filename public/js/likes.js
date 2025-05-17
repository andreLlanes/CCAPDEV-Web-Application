document.addEventListener("DOMContentLoaded", () => {
    const attachLikeDislikeHandlers = () => {
      document.querySelectorAll(".like").forEach((button) => {
        button.addEventListener("click", async () => {
          const postId = button.getAttribute("data-id");
  
          try {
            const response = await fetch(`/posts/${postId}/like`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            });
  
            const data = await response.json();
            if (response.ok) {
              const postContainer = button.closest(".posts-footer");
              const likeCountEl = postContainer.querySelector(".like-count");
              const dislikeCountEl = postContainer.querySelector(".dislike-count");
  
              if (likeCountEl) likeCountEl.textContent = data.likeCount;
              if (dislikeCountEl) dislikeCountEl.textContent = data.dislikeCount;
  
              button.classList.add("active");
              postContainer.querySelector(".dislike")?.classList.remove("active");
            } else {
              alert(data.message || "Error liking post");
            }
          } catch (err) {
            console.error("Error liking post:", err);
          }
        });
      });
  
      document.querySelectorAll(".dislike").forEach((button) => {
        button.addEventListener("click", async () => {
          const postId = button.getAttribute("data-id");
  
          try {
            const response = await fetch(`/posts/${postId}/dislike`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            });
  
            const data = await response.json();
            if (response.ok) {
              const postContainer = button.closest(".posts-footer");
              const dislikeCountEl = postContainer.querySelector(".dislike-count");
              const likeCountEl = postContainer.querySelector(".like-count");
  
              if (dislikeCountEl) dislikeCountEl.textContent = data.dislikeCount;
              if (likeCountEl) likeCountEl.textContent = data.likeCount;
  
              button.classList.add("active");
              postContainer.querySelector(".like")?.classList.remove("active");
            } else {
              alert(data.message || "Error disliking post");
            }
          } catch (err) {
            console.error("Error disliking post:", err);
          }
        });
      });
    };
  
    attachLikeDislikeHandlers();
  });