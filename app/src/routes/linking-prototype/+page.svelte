<script lang="ts">
	import UchimataApp from "$lib/UchimataApp.svelte";
	import { onMount } from "svelte";

	const modelAUrl = "";
	const modelBUrl = "";

	onMount(() => {
		console.log("hi.");
	});
</script>

<h1>Linking prototype.</h1>
<div style="width: 500px; border: 5px solid red; padding: 10px;">
	<UchimataApp />
</div>
<div style="width: 800px; border: 5px solid blue; padding: 10px;">
	<UchimataApp />
</div>
