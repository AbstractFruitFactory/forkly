<script lang="ts">
  // import { fade } from "svelte/transition";
  // export let onImageLoad: (image: string | ArrayBuffer) => any = () => {};

  let img;
  let imgIconHidden = false 
  let imgHidden = true

  function addImage(event) {
    if (!event.target.files[0]) return;

    const file = event.target.files[0];
 
    imgIconHidden = true
    imgHidden = false
    img.src = URL.createObjectURL(file);
  }
</script>

<style lang="scss">
  .imageArea {
    cursor: pointer;
    width: 100%;
    margin: 0 30px;
    display: flex;
    align-items: center;
  }

  .border {
    border-style: dashed;
  }

  .imageContainer {
    display: flex;
    width: 100%;
  }

  .imageIcon {
    margin: auto;
  }

  .hidden {
    display: none;
  }

  .image {
    max-width: 100%;
  }
</style>

<label class="imageContainer">
  <input
  id="image-upload"
  accept="image/*"
  type="file"
  on:input={addImage}
  hidden />
  <div class="imageArea" class:border={imgHidden}>
    <img alt="Food" class="image" class:hidden={imgHidden} bind:this={img}/>
    <i class="fa fa-image fa-2x imageIcon" class:hidden="{imgIconHidden}" />
  </div>
</label>

