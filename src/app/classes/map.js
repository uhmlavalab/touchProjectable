import * as d3 from 'd3';

export class Map {

  constructor(mapDivId, mapImageUrl, mapImageWidth, mapImageHeight, scale, bounds) {
    this.scale = scale;
    this.mapDiv = d3.select(`#${mapDivId}`);
    this.width = mapImageWidth * this.scale;
    this.height = mapImageHeight * this.scale;
    this.rasterBounds = bounds;
    this.curYear = null;
    this.curScenario = null;

    this.layers = {};
    this.IAL = false;

    this.projection = d3.geo.mercator()
      .scale(1)
      .translate([0, 0])

    this.path = d3.geo.path()
      .projection(this.projection)

    this.map = this.mapDiv.append('svg')
      .attr('width', this.width)
      .attr('height', this.height)

    this.map.append('image')
      .attr('xlink:href', `${mapImageUrl}`)
      .attr('width', this.width)
      .attr('height', this.height)

  }

  addGeoJsonLayer(fileUrl, layerName, year, fillColor, lineColor, lineWidth) {
    d3.json(`${fileUrl}`, (error, geoData) => {
      const bounds = [this.projection(this.rasterBounds[0]), this.projection(this.rasterBounds[1])];
      const scale = 1 / Math.max((bounds[1][0] - bounds[0][0]) / this.width, (bounds[1][1] - bounds[0][1]) / this.height);
      const transform = [(this.width - scale * (bounds[1][0] + bounds[0][0])) / 2, (this.height - scale * (bounds[1][1] + bounds[0][1])) / 2];

      const proj = d3.geo.mercator()
        .scale(scale)
        .translate(transform)

      const path = d3.geo.path()
        .projection(proj)

      const layer = {
        enabled: true,
        parcels: [],
        fillColor: fillColor,
        lineColor: lineColor,
        lineWidth: lineWidth,
        year: year
      }

      this.map.selectAll(layerName)
        .data(geoData.features)
        .enter().append('path')
        .attr("d", path)
        .attr('class', layerName)
        .each(function (d) {
          if (layerName == 'solar') {
            const cf = d.properties.cf_1;
            const capacity = d.properties.capacity;
            const value = cf * capacity * 8760;
            const ial = (d.properties.IAL == "Y") ? true : false;
            layer.parcels.push({ 'path': this, 'value': value, 'ial': ial });
          }
          else if (layerName == 'wind') {
            const cf = 0.2283942;
            const capacity = d.properties.MWac;
            const value = cf * capacity * 8760;
            const type = d.properties.type;
            layer.parcels.push({ 'path': this, 'value': capacity, 'type': type });
          }
          else {
            d3.select(this)
              .style('fill', fillColor)
              .style('opacity', 0.5)
              .style('stroke', lineColor)
              .style('stroke-width', lineWidth + 'px')
          }
        }).call(() => {
          this.layers[layerName] = layer;
          if (layerName == 'solar') {
            this.layers[layerName].parcels.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
            this.setSolarParcelsColor(year, 'postapril');
          }
          if (layerName == 'wind') {
            this.layers[layerName].parcels.sort((a, b) => parseFloat(b.type) - parseFloat(a.type) || parseFloat(b.value) - parseFloat(a.value));
            this.setWindParcelsColor(year, 'postapril');
          }
        })
    });
  }

  setSolarParcelsColor(year, scenario) {
    this.curYear = year;
    this.curScenario = scenario;
    this.layers['solar'].year = year;
    if (this.layers['solar'].enabled) {
      let solarTotal = 0;
      solarGenYearly.forEach(el => {
        if (el.year == year) {
          solarTotal = el[scenario];
        }
      });
      this.layers['solar'].parcels.forEach(el => {
        if (el.ial && this.IAL) {
          d3.select(el.path)
          .style('fill', "#000000")
          .style('opacity', 1.0)
          .style('stroke', "#000000")// this.layers['solar'].lineColor)
          .style('stroke-width', this.layers['solar'].lineWidth + 'px');
        }
        else if (solarTotal > 0) {
          d3.select(el.path)
            .style('fill', this.layers['solar'].fillColor)
            .style('opacity', 0.5)
            .style('stroke', this.layers['solar'].lineColor)
            .style('stroke-width', this.layers['solar'].lineWidth + 'px');
          solarTotal -= el.value;
        } else {
          d3.select(el.path)
            .style('fill', 'transparent')
            .style('opacity', 0.5)
            .style('stroke', this.layers['solar'].lineColor)
            .style('stroke-width', this.layers['solar'].lineWidth + 'px');
        }
      })
    }
  }

  toggleIAL() {
    this.IAL = !this.IAL;
    this.setSolarParcelsColor(this.curYear, this.curScenario);
  }

  setWindParcelsColor(year, scenario) {
    this.layers['wind'].year = year;
    if (this.layers['wind'].enabled) {
      let windTotal = 0;
      windGenYearly.forEach(el => {
        if (el.year == year) {
          windTotal = el[scenario] - 99;

        }
      });
      this.layers['wind'].parcels.forEach(el => {
        if (windTotal > 0) {
          d3.select(el.path)
            .style('fill', this.layers['wind'].fillColor)
            .style('opacity', 1.0)
            .style('stroke', this.layers['wind'].lineColor)
            .style('stroke-width', this.layers['wind'].lineWidth + 'px');
            windTotal -= el.value;
        } else {
          d3.select(el.path)
            .style('fill', 'transparent')
            .style('opacity', 0.5)
            .style('stroke', this.layers['wind'].lineColor)
            .style('stroke-width', this.layers['wind'].lineWidth + 'px');
        }
      })
    }
  }

  toggleLayer(layerName) {
    this.layers[layerName].enabled = !this.layers[layerName].enabled;
    if (layerName == 'solar') {
      this.setSolarParcelsColor(this.layers['solar'].year);
    }
    if (layerName == 'wind') {
      this.setWindParcelsColor(this.layers['wind'].year);
    }
    if (!this.layers[layerName].enabled) {
      this.map.selectAll(`.${layerName}`).style('opacity', 0.0);
    } else {
      this.map.selectAll(`.${layerName}`).style('opacity', 0.5);
    }

  }

  hideLayer(layerName) {
    this.layers[layerName].enabled = false;
    if (layerName == 'solar') {
      this.setSolarParcelsColor(this.layers['solar'].year);
    }
    if (layerName == 'wind') {
      this.setWindParcelsColor(this.layers['wind'].year);
    }
      this.map.selectAll(`.${layerName}`).style('opacity', 0.0);
  }

  showLayer(layerName) {
    this.layers[layerName].enabled = true;
    if (layerName == 'solar') {
      this.setSolarParcelsColor(this.layers['solar'].year);
    }
    if (layerName == 'wind') {
      this.setWindParcelsColor(this.layers['wind'].year);
    }
      this.map.selectAll(`.${layerName}`).style('opacity', 0.5);
  }

  removeLayer(layerName) {
    this.map.selectAll(`.${layerName}`).remove();
  }
}
