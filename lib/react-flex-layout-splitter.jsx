import React from 'react'

export default class LayoutSplitter extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      active: false
    }
    this.up = this.up.bind(this)
    this.move = this.move.bind(this)
  }

  componentDidMount() {
    document.addEventListener('mouseup', this.up)
    document.addEventListener('mousemove', this.move)
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.up)
    document.removeEventListener('mousemove', this.move)
  }

  move(event) {
    if (this.state.active) {
      let layout1 = this.props.getPreviousLayout()
      let layout2 = this.props.getNextLayout()
      if (layout1 && layout2) {
        let current = this.props.orientation === 'horizontal' ? event.clientX : event.clientY
        let position = this.state.position

        let isLayout1Flex = layout1.props.layoutWidth === 'flex'
        let isLayout2Flex = layout2.props.layoutWidth === 'flex'
        if (isLayout1Flex && isLayout2Flex) {
          throw 'Do not support resizing two flex Layouts'
        } else if (isLayout1Flex) {
          // Layout 2 has fixed size
          let newSize = layout2.props.layoutWidth - (current - position)
          layout2.setState({layoutWidth: newSize})
        } else if (isLayout2Flex) {
          // Layout 1 has fixed size
          let newSize = layout1.props.layoutWidth - (position - current)
          layout1.setState({layoutWidth: newSize})
        } else {
          // Both are fixed width
          let delta = position - current
          let panel1NewSize = layout1.props.layoutWidth - delta
          let panel2NewSize = layout2.props.layoutWidth + delta
          layout1.setState({layoutWidth: panel1NewSize})
          layout2.setState({layoutWidth: panel2NewSize})
        }
      }
    }
  }

  up() {
    this.setState({ active: false })
  }

  handleDown(event) {
    let position = this.props.orientation === 'horizontal' ? event.clientX : event.clientY;
    this.setState({
        active: true,
        position: position
    })
  }

  render() {
    //let orientation = this.props.orientation;
    let classes = ['Resizer', 'horizontal'];
    let downHandler = this.handleDown.bind(this)
    return <span className={classes.join(' ')} onMouseDown={downHandler} />
  }
}

LayoutSplitter.propTypes = {
  orientation: React.PropTypes.string,
  previousLayout: React.PropTypes.object,
  nextLayout: React.PropTypes.object
}
LayoutSplitter.defaultProps = {
  layoutWidth: 11,
  layoutHeight: 11
}