<style lang="scss">
  /* The Overlay (background) */
  .overlay {
    /* Height & width depends on how you want to reveal the overlay (see JS below) */
    height: 100%;
    width: 100%;
    position: fixed; /* Stay in place */
    z-index: 1; /* Sit on top */
    left: 0;
    top: 0;
    background-color: rgb(0, 0, 0); /* Black fallback color */
    background-color: rgba(0, 0, 0, 0.9); /* Black w/opacity */
    overflow-x: hidden; /* Disable horizontal scroll */
    transition: 0.5s; /* 0.5 second transition effect to slide in or slide down the overlay (height or width, depending on reveal) */
  }

  /* Position the content inside the overlay */
  .content {
    position: relative;
    top: 25%; /* 25% from the top */
    width: 100%; /* 100% width */
    margin-top: 30px; /* 30px top margin to avoid conflict with the close button on smaller screens */
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* Position the close button (top right corner) */
  .overlay .closebtn {
    position: absolute;
    top: 20px;
    right: 45px;
    font-size: 60px;
  }
</style>

<div class="overlay">
  <a href="/" class="closebtn">&times;</a>

  <div class="content">
    <slot />
  </div>
</div>
