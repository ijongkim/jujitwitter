import React from 'react'
import Chart from 'chart.js'

export default class ChartDisplay extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      frequencyChart: {},
      sentimentChart: {}
    }
    this.createFrequency = this.createFrequency.bind(this)
    this.createSentiment = this.createSentiment.bind(this)
    this.addData = this.addData.bind(this)
    this.clearData = this.clearData.bind(this)
    this.updateChart = this.updateChart.bind(this)
  }

  createFrequency (id) {
    let ctx = document.getElementById(id).getContext('2d')
    let chart = new Chart(ctx, {
      type: 'horizontalBar',
      data: {
        labels: [],
        datasets: [{
          label: 'Count',
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: []
        }]
      },
      options: {
        maintainAspectRatio: true,
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Top 25 Words',
          fontSize: 30
        }
      }
    })
    this.setState({frequencyChart: chart})
    return chart
  }

  createSentiment (id) {
    let ctx = document.getElementById(id).getContext('2d')
    let chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Avg Sentiment',
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          pointRadius: 0,
          pointHitRadius: 25,
          data: []
        }]
      },
      options: {
        maintainAspectRatio: true,
        legend: {
          display: false
        },
        title: {
          display: true,
          text: 'Avg Sentiment/Tweet Over Time',
          fontSize: 30
        }
      }
    })
    this.setState({sentimentChart: chart})
    return chart
  }

  addData (chart, tuple) {
    chart.data.labels.push(tuple[0])
    chart.data.datasets[0].data.push(tuple[1])
  }

  clearData (chart) {
    chart.data.labels = []
    chart.data.datasets[0].data = []
  }

  updateChart (chart, array, time) {
    this.clearData(chart)
    let idx = 0
    let interval = setInterval(function () {
      this.addData(chart, array[idx])
      if (idx < array.length - 1) {
        idx++
      } else {
        clearInterval(interval)
      }
      chart.update()
    }.bind(this), time)
  }

  componentDidMount () {
    let frequency = this.createFrequency('frequencyCanvas')
    let sentiment = this.createSentiment('sentimentCanvas')
    let base = 100
    let modifier = this.props.stats.frequency.length / this.props.stats.sentiment.length
    this.updateChart(frequency, this.props.stats.frequency, base)
    this.updateChart(sentiment, this.props.stats.sentiment, modifier * base)
  }

  render () {
    return (
      <div id="userAnalysis">
        <canvas id="frequencyCanvas" className="panel"></canvas>
        <canvas id="sentimentCanvas" className="panel"></canvas>
      </div>
    )
  }
}
