<script lang="ts">
	import UchimataApp from "$lib/UchimataApp.svelte";
</script>

<svelte:head>
	<title>uchimata: visualize chromatin in space.</title>
</svelte:head>

<div class="max-w-2xl text-xl">
	<p class="py-2">
		<b>uchimata</b> is a javascript library for visualization of three-dimensional
		chromatin models.
	</p>
	<p class="py-2">
		Our goal is to provide a simple-to-use tool for working with 3D data in
		the genomics context. We put emphasis on usage in various environments:
		besides making a single visualization app, we also package uchimata as a
		widget usable in python-based computational notebooks, such as Jupyter.
	</p>
	<div>
		The uchimata ecosystem consists of:
		<ul class="list-none list-inside ml-5 mt-2">
			<li>
				<b>uchimata</b>: the js library <br />

				<span class="m-10">
					&rarr; <a
						class="text-blue-600 dark:text-blue-500 hover:underline"
						href="https://github.com/dvdkouril/uchimata"
						target="_blank">github</a
					>
				</span>
			</li>
			<li>
				<b>chromospyce</b>: a widget for Jupyter-like notebooks <br />
				<span class="m-10">
					&rarr;
					<a
						class="text-blue-600 dark:text-blue-500 hover:underline"
						href="https://github.com/dvdkouril/chromospyce"
						target="_blank">github</a
					>
				</span>
			</li>
		</ul>
	</div>
</div>

<div style="width: 800px">
	<UchimataApp />
</div>
