<script setup lang="ts">
import * as d3 from "d3";
import { ref, onMounted } from "vue";
import { useResizeObserver } from "@/utilities/resize-observer";
import type { DataPoint } from "@/interfaces/RealtimeChart";

const svgRef = ref(null);
const currentDataPoint = ref(0);
const { resizeRef, resizeState } = useResizeObserver();

let connection: WebSocket | null = null;
const connect = async () => {
  const client = await fetch('http://192.168.1.100:4200', {
    method: 'POST',
    //@ts-ignore
    body:  { connection: 'monitor' }
  })
  const worker = await client.json()
  
  const url = `ws://192.168.1.100:4200/ws?id=${worker.id}`
  
  connection = connection ?? new WebSocket(url)
  
  connection.onopen = () => {
    console.log('websocket connected!')
  }
  
  connection.onmessage = (response) => {
    try {
      const data: any = JSON.parse(response.data)
      console.log(data)
      if (data.cpu.usage) {
        currentDataPoint.value = data.cpu.usage
      }
    } catch (error) {}
  }
  
  connection.onclose = () => {
    console.log("closed connection")
    connection = null;
  }
}

onMounted(() => {
  connect().then(() => {
    const svg = d3.select(svgRef.value);
    
    const margin = {top: 50, bottom: 50, left: 50, right: 50};
    const width = resizeState.dimensions.width - margin.left - margin.right;
    const height = resizeState.dimensions.height - margin.top - margin.bottom;
    
    const limit = 60;
    const duration = 500;
    
    let data: DataPoint[] = [];
    
    let g = svg.append('g').attr('transform', `translate( ${margin.left}, ${margin.top} )`);
    
    g.append('defs').append('clipPath')
    .attr('id', 'clip2')
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height);
    
    // ParseTime
    
    const timeScale = d3.scaleTime()
    .range([0, width]);
    
    const valueScale = d3.scaleLinear()
    .domain([0, 100])
    .range([height, 0]);
    
    const line = d3.line()
    .curve(d3.curveBasis)
    .x((d: any) => timeScale(d.time))
    .y((d: any) => valueScale(d.value));
    
    const xAxis = d3.axisBottom(timeScale);
    
    const axisCall = g.append('g')
    .attr('transform', `translate(0, ${height})`);
    
    axisCall.call(xAxis);
    
    g.append('g')
    .attr('class', 'axis axis--y')
    .call(d3.axisLeft(valueScale))
    
    let pathsG = g.append('g').attr('id', 'paths').attr('class', 'paths').attr('clip-path', 'url(#clip2)');
    
    function updateChart() {
      let now = Date.now();
      data.push({
        time: now,
        value: parseInt(currentDataPoint.value)
      });
      
      // Shift domain
      timeScale.domain([now - ((limit - 2) * duration), now - duration]);
      
      // @ts-ignore
      axisCall.transition().duration(duration).ease(d3.easeLinear, 2).call(xAxis);
      
      let gline = pathsG.selectAll('.gline').data([data]);
      let genter = gline.enter()
      .append('g')
      .attr('class', 'gline')
      // @ts-ignore
      .merge(gline);
      
      let gsvg = genter.selectAll('path').data((dp) => [dp]);
      
      gsvg.enter()
      .append('path').attr('class', 'line')
      .style('stroke', '#D073BA')
      .style('fill', 'none')
      // @ts-ignore
      .merge(gsvg)
      .transition()
      .duration(duration)
      // @ts-ignore
      .ease(d3.easeLinear, 2)
      // @ts-ignore
      .attr('d', line(data))
      .attr('transform', null);
    }
    
    setInterval(() => {
      //console.log('hello');
      updateChart();
    }, duration);
  })
})
</script>

<template>
  <div ref="resizeRef">
    <svg width="800" height="300" ref="svgRef">
    </svg>
  </div>
</template>