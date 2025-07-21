<script lang="ts">
        import { onMount } from "svelte";
        import {
                initScene,
                display,
                loadFromURL,
                addStructureToScene,
        } from "uchimata";
        import type { ViewConfig } from "../../../dist/chromatin-types";

        let appEl: HTMLElement | undefined = undefined;
        let chromatinScene = initScene();

        $: [renderer, canvas] = display(chromatinScene, {
                alwaysRedraw: true,
        });

        onMount(async () => {
                const testChunk = await loadFromURL(
                        "https://raw.githubusercontent.com/dvdkouril/chromospace-sample-data/main/dros.3.arrow",
                        { center: true, normalize: true },
                );
                if (!testChunk) {
                        console.error("Failed to fetch sample data");
                        return;
                }
                const num = testChunk.data.numRows;
                const sineWave = (
                        amplitude: number,
                        frequency: number,
                        length: number,
                ) =>
                        Array.from(
                                { length },
                                (_, i) => amplitude * Math.sin(frequency * i),
                        );
                const sineValues = sineWave(100, 0.2, num);

                const viewConfig = {
                        scale: {
                                values: sineValues,
                                min: -100,
                                max: 100,
                                scaleMin: 0.01,
                                scaleMax: 0.03,
                        },
                        links: false,
                        mark: "sphere",
                        color: {
                                values: sineValues,
                                min: 0,
                                max: 100,
                                colorScale: "viridis",
                        },
                };
                let chromatinScene = initScene();
                chromatinScene = addStructureToScene(
                        chromatinScene,
                        testChunk,
                        viewConfig as ViewConfig,
                );
                const [renderer, canvas] = display(chromatinScene, {
                        alwaysRedraw: true,
                });

                //~ add canvas to the page
                //let appEl = document.querySelector("#app");
                if (canvas && appEl) {
                        appEl.appendChild(canvas);
                }
        });
</script>

<div bind:this={appEl}></div>
