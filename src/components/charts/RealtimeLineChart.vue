<script setup lang="ts">
import * as d3 from "d3";
import { ref, onMounted, watchEffect } from "vue";
import { useResizeObserver } from "@/utilities/resize-observer";

const svgRef = ref(null);

onMounted(() => {
  const svg = d3.select(svgRef.value);

  const MARGIN = {
    TOP: 50,
    BOTTOM: 50,
    LEFT: 50,
    RIGHT: 50
  };

  const WIDTH = svg.attr('width') - MARGIN.LEFT - MARGIN.RIGHT;
  const HEIGHT = svg.attr('height') - MARGIN.TOP - MARGIN.BOTTOM;

  const limit = 60;
  const duration = 500;
  let dataList = [];

  let g = svg.append('g').attr('transform', `translate( ${MARGIN.LEFT}, ${MARGIN.TOP} )`);

  g.append('defs').append('clipPath')
    .attr('id', 'clip2')
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', WIDTH)
    .attr('height', HEIGHT);

  // ParseTime

  const timeScale = d3.scaleTime()
    .range([0, WIDTH]);

  const valueScale = d3.scaleLinear()
    .domain([0, 10])
    .range([HEIGHT, 0]);

  const line = d3.line()
    .curve(d3.curveBasis)
    .x((d) => timeScale(d.time))
    .y((d) => valueScale(d.value));

  const xAxis = d3.axisBottom(timeScale);

  const axisCall = g.append('g')
    .attr('transform', `translate(0, ${HEIGHT})`);

  axisCall.call(xAxis);

  g.append('g')
    .attr('class', 'axis axis--y')
    .call(d3.axisLeft(valueScale))

  let pathsG = g.append('g').attr('id', 'paths').attr('class', 'paths').attr('clip-path', 'url(#clip2)');

  function updateChart() {
    let now = Date.now();
    dataList.push({
      time: now,
      value: Math.floor(Math.random() * 10)
    });

    // Shift domain
    timeScale.domain([now - ((limit - 2) * duration), now - duration]);

    axisCall.transition().duration(duration).ease(d3.easeLinear, 2).call(xAxis);

    let minerG = pathsG.selectAll('.minerLine').data([dataList]);
    let minerGEnter = minerG.enter()
      .append('g')
      .attr('class', 'minerLine')
      .merge(minerG);

    let minerSVG = minerGEnter.selectAll('path').data(function(d) {
      return [d];
    });

    let minerSVGenter = minerSVG.enter()
      .append('path').attr('class', 'line')
      .style('stroke', '#D073BA')
      .style('fill', 'none')
      .merge(minerSVG)
      .transition()
      .duration(duration)
      .ease(d3.easeLinear, 2)
      .attr('d', line(dataList))
      .attr('transform', null);

  }

  setInterval(function() {
    //console.log('hello');
    updateChart();
  }, 500);
})
</script>
  
<template>
  <div ref="resizeRef">
    <svg width="800" height="300" ref="svgRef">
    </svg>
  </div>
</template>