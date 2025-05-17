document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".comment").forEach((btn) => {
    btn.addEventListener("click", () => {
      const postContainer = btn.closest(".cont");
      const commentSection = postContainer.querySelector(".comment-section");
      commentSection.style.display =
        commentSection.style.display === "none" ? "block" : "none";
    });
  });

  document.querySelectorAll(".comment-form").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const postId = form.getAttribute("data-postid");
      const textarea = form.querySelector("textarea");
      const commentText = textarea.value.trim();

      if (!commentText) return;

      try {
        const response = await fetch(`/comments/${postId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: commentText }),
        });

        const data = await response.json();
        if (response.ok) {
          const commentList = form
            .closest(".cont")
            .querySelector(".comment-list");

          // 👉 Format createdAt using JS
          const formattedDate = new Date(data.comment.createdAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          // 👉 Render comment with date
          const li = document.createElement("li");
          li.innerHTML = `
            <strong>${data.comment.user.username}:</strong> ${data.comment.content}
            <p class="comment-date">Posted on: ${formattedDate}</p>
          `;

          commentList.appendChild(li);
          textarea.value = "";
        } else {
          alert(data.message || "Failed to post comment.");
        }
      } catch (err) {
        console.error("Error posting comment:", err);
      }
    });
  });
});