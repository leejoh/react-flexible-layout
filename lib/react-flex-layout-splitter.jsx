import React from 'react'
import './react-flex-layout-splitter.css'

export default class LayoutSplitter extends React.Component {
  constructor(props) {
    super(props)
    this.document = props.document || document

    this.state = {
      active: false
    }
    this.handleMouseUp = this.handleMouseUp.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleMouseDown = this.handleMouseDown.bind(this)
  }

  componentDidMount() {
    this.document.addEventListener('mouseup', this.handleMouseUp)
    this.document.addEventListener('mousemove', this.handleMouseMove)
    if (this.props.orientation === 'horizontal') {
      this.state.layoutWidth = this.props.layoutWidth || 11
      this.setState(this.state)
      this.props.layoutChanged()
    }
    if (this.props.orientation === 'vertical') {
      this.state.layoutHeight = this.props.layoutHeight || 11
      this.setState(this.state)
      this.props.layoutChanged()
    }
  }

  componentWillUnmount() {
    this.document.removeEventListener('mouseup', this.handleMouseUp)
    this.document.removeEventListener('mousemove', this.handleMouseMove)
  }

  handleMouseMove(event) {
    if (this.state.active) {
      let currentPosition = this.props.orientation === 'horizontal' ? event.clientX : event.clientY;
      this.state.newPositionHandler(currentPosition)
    }
  }

  handleMouseUp() {
    if (this.state.active) {
      this.setState({ active: false })
      this.props.restoreSelection()
    }
  }

  handleMouseDown(event) {
    let downPosition = this.props.orientation === 'horizontal' ? event.clientX : event.clientY;
    let layoutProp = this.props.orientation === 'horizontal' ? 'layoutWidth' : 'layoutHeight'
    let minSizeProp = this.props.orientation === 'horizontal' ? 'minWidth' : 'minHeight'
    let updateFunctionName = this.props.orientation === 'horizontal' ? 'setWidth' : 'setHeight'
    let getSizeFunctionName = this.props.orientation === 'horizontal' ? 'getWidth' : 'getHeight'
    let layout1 = this.props.getPreviousLayout()
    let layout2 = this.props.getNextLayout()
    let isLayout1Flex = layout1.props[layoutProp] === 'flex'
    let isLayout2Flex = layout2.props[layoutProp] === 'flex'
    if (isLayout1Flex && isLayout2Flex) {
      throw new Error('You cannot place a LayoutSplitter between two flex Layouts')
    }

    const availableSize = layout1[getSizeFunctionName]() + layout2[getSizeFunctionName]();
    const layout1MinSize = layout1.props[minSizeProp]
    const layout2MinSize = layout2.props[minSizeProp]
    const layout1MaxSize = availableSize - layout2MinSize
    const layout2MaxSize = availableSize - layout1MinSize

    if (layout1 && layout2) {
      this.props.hideSelection()
      let newPositionHandler
      if (isLayout1Flex) {
        // Layout 2 has fixed size
        let originalSize = layout2.state[layoutProp]
        newPositionHandler = (currentPosition) => {
          let delta = downPosition - currentPosition
          let newSize = originalSize + delta
          newSize = Math.max(layout2MinSize, Math.min(newSize, layout2MaxSize))
          layout2[updateFunctionName](newSize)
        }
      } else if (isLayout2Flex) {
        // Layout 1 has fixed size
        let originalSize = layout1.state[layoutProp]
        newPositionHandler = (currentPosition) => {
          let delta = currentPosition - downPosition
          let newSize = originalSize + delta
          newSize = Math.max(layout1MinSize, Math.min(newSize, layout1MaxSize))
          layout1[updateFunctionName](newSize)
        }
      }
      else {
        // Both are fixed width
        let originalSize1 = layout1.state[layoutProp]
        newPositionHandler = (currentPosition) => {
          let delta = currentPosition - downPosition
          const layout1NewSize = Math.max(layout1MinSize, Math.min(originalSize1 + delta, layout1MaxSize))
          const layout2NewSize = availableSize - layout1NewSize
          layout1[updateFunctionName](layout1NewSize)
          layout2[updateFunctionName](layout2NewSize)
        }
      }

      this.setState({
        active: true,
        newPositionHandler: newPositionHandler
      })
    }
  }

  render() {
    //let orientation = this.props.orientation;
    let classes = ['LayoutSplitter', this.props.orientation];
    let style = {
      width: this.state.layoutWidth || this.props.containerWidth,
      height: this.state.layoutHeight || this.props.containerHeight
    }

    return <div className={classes.join(' ')} style={style} onMouseDown={this.handleMouseDown} />
  }
}

LayoutSplitter.propTypes = {
  orientation: React.PropTypes.string,
  getPreviousLayout: React.PropTypes.func,
  getNextLayout: React.PropTypes.func
}
