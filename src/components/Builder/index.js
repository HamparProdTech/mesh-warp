import React, { useEffect, useRef, useState } from "react"
import { traverseTwoPhase } from "react-dom/test-utils"
import GridManager from "../../lib/GridManager"
import CanvasDummyBuilder from "../../lib/CanvasDummyBuilder"

import "./style.scss"

import { Actions } from "../../App"

const Builder = React.forwardRef((props, ref) => {
  const { sourceBitmapData, dispatch } = props

  const guideRight = require("../../assets/guides/guide_right_01.jpg").default
  const guideLeft01 = require("../../assets/guides/guide_left_01.jpg").default
  const guideLeft02 = require("../../assets/guides/guide_left_02.jpg").default

  const images = useRef([guideRight, guideLeft01, guideLeft02]).current
  const bitmapData = useRef(new Array(images.length).fill(null)).current

  const [imageArray, setImageArray] = useState()
  const [dummyIndex, setDummyIndex] = useState()
  const [dummy, setDummy] = useState()
  const [opacity, setOpacity] = useState(1)
  const [showDots, setShowDots] = useState(true)
  const [wireframeOpacity, setWireframeOpacity] = useState(1)

  const gridItems = useRef([]).current

  const [forceUpdate, setForceUpdate] = useState()

  const canvasHolder = useRef()
  const dotsHolder = useRef()

  useEffect(() => {
    if (!imageArray) {
      let completed = 0
      function callback() {
        if (++completed === images.length) {
          // if (CanvasDummyBuilder.meshables[0].parent) {
          // gridItems.current = CanvasDummyBuilder.meshables.map((dummy, i) => {
          //   const gridManager = new GridManager()
          //   const { parent } = dummy
          //   gridManager.init(parent.width, parent.height, 2, 2)
          //   CanvasDummyBuilder.meshables[i] = dummy.initMesh(gridManager)
          //   return gridManager
          // })
          // }

          setDummyIndex(0)
        }
      }

      images.forEach((url, index) => {
        const img = new Image()
        img.src = url

        bitmapData[index] = img

        img.onload = callback
      })
    }
  }, [imageArray])

  useEffect(() => {
    if (dummyIndex >= 0) {
      setDummy(CanvasDummyBuilder.meshables[dummyIndex])
    }
  }, [dummyIndex])

  useEffect(() => {
    if (dummy) {
      while (canvasHolder.current.childNodes.length)
        canvasHolder.current.removeChild(canvasHolder.current.childNodes[0])

      dummy.refresh()
      canvasHolder.current.appendChild(dummy.meshCanvas.output)
      canvasHolder.current.appendChild(dummy.meshCanvas.wireframe)
    }
  }, [dummy])

  useEffect(() => {
    if (dummy) {
      dummy.meshCanvas.wireframe.style.opacity = wireframeOpacity
    }
  }, [wireframeOpacity])

  if (!dummy) return null

  // function getControls(type) {
  //   const number = dummy.meshCanvas.gridManager[type]
  //   const dummies
  //   switch (type) {
  //     case "columns":
  //       return <div className="controls-column"></div>
  //       break
  //   }
  // }

  return (
    <div className="builder">
      <div className="holder">
        <div
          className="guide"
          style={{
            width: dummy.meshCanvas.output.width + 200,
            height: dummy.meshCanvas.output.height + 200,
          }}
        >
          <img draggable={false} src={bitmapData[dummyIndex].src} alt={`guide`} />
          <div
            className="canvas-holder"
            ref={canvasHolder}
            style={{
              opacity,
            }}
          ></div>
          {showDots && (
            <div
              ref={dotsHolder}
              id="dots-holder"
              className="dots-holder"
              onMouseDown={event => {
                dispatch(event, Infinity, dummyIndex, dotsHolder.current)
              }}
              style={{
                width: dummy.meshCanvas.output.width,
                height: dummy.meshCanvas.output.height,
              }}
            >
              {/* <div className="controls">{getControls("columns")}</div> */}
              {/* <div> */}
              {dummy.meshCanvas.gridManager.positions.map((coord, index) => {
                return (
                  <div
                    onMouseDown={event => {
                      dispatch(event, index, dummyIndex, dotsHolder.current)
                    }}
                    key={`dot_${index}`}
                    className="grid-dot"
                    style={{
                      left: coord.x,
                      top: coord.y,
                    }}
                  >
                    <div className="cross-01" />
                    <div className="cross-02" />
                    {/* <p>{index}</p> */}
                  </div>
                )
              })}
              {/* </div> */}
            </div>
          )}
        </div>
      </div>
      <div className="controls">
        <div className="button-holder">
          <div>THESE ARE THE DUMMIES</div>
          {CanvasDummyBuilder.meshables.map((ignore, index) => {
            return (
              <div
                className="button"
                key={`button_${index}`}
                onClick={() => {
                  setDummyIndex(index)
                  setDummy(CanvasDummyBuilder.meshables[index])
                }}
              >{`Show Canvas ${index}`}</div>
            )
          })}
        </div>
        <div className="button-holder">
          <div
            className="button"
            onClick={() => {
              setOpacity(opacity ? 0 : 1)
            }}
          >
            <p>{`${!opacity ? "Show" : "Hide"} Mesh Warp`}</p>
          </div>
        </div>
        <div className="button-holder">
          <div
            className="button"
            onClick={() => {
              setWireframeOpacity(+!wireframeOpacity)
            }}
          >
            <p>{`${wireframeOpacity ? "Show" : "Hide"} Wireframe`}</p>
          </div>
        </div>
        <div className="button-holder">
          <div
            className="button"
            onClick={() => {
              setShowDots(!showDots)
            }}
          >
            <p>{`${!showDots ? "Show" : "Hide"} Dots`}</p>
          </div>
        </div>
        <div className="button-holder">
          <div
            className="button"
            onClick={() => {
              setOpacity(opacity === 1 ? 0.55 : 1)
            }}
          >
            <p>Toggle Transparency</p>
          </div>
        </div>
        <div className="button-holder">
          <div
            className="button"
            onClick={() => {
              console.clear()
              const gm = dummy.meshCanvas.gridManager
              const columns = gm.columns + 1
              console.warn("DOUBLING UP", columns)
              const new_00 = gm.positions.map((pos, i) => pos)
              const new_01 = []
              const new_02 = []
              const new_03 = []
              let fill_type = "across"
              let additional = 0
              let balls = 0
              const final = []

              function getAverage(...indexes) {
                console.log(indexes)
                let x = 0
                let y = 0
                indexes.forEach(index => {
                  console.warn("index is", index)
                  x += gm.positions[index].x
                  y += gm.positions[index].y
                })
                x /= indexes.length
                y /= indexes.length

                console.log("RETURNING")
                console.log({ x, y })
                console.log("")
                return { x, y }
              }

              // console.warn(getAverage({ x: 0, y: 0 }, { x: 2, y: 2 }))
              // console.warn(getAverage({ x: 0, y: 0 }, { x: 2, y: 2 }, { x: 10, y: 10 }, { x: 20, y: 20 }))

              // return
              for (let i = 0; i < gm.positions.length; i++) {
                // new_02.push((i + (i + columns)) / 2)
                if (i + columns < gm.positions.length) new_02.push(getAverage(i, i + columns))
                if (i % columns === gm.columns) {
                } else {
                  // new_01.push((i + (i + 1)) / 2)
                  if (i + 1 < gm.positions.length) new_01.push(getAverage(i, i + 1))
                  // if (i < gm.positions.length - columns) {
                  // new_03.push((i + (i + 1) + (i + columns) + (i + columns + 1)) / 2)
                  if (i + columns < gm.positions.length) new_03.push(getAverage(i, i + 1, i + columns, i + columns + 1))
                  // }
                }
              }

              console.log(new_00)
              console.log(new_01)
              console.log(new_02)
              console.log(new_03)
              // return

              let direction = "across"

              let total = new_00.length + new_01.length + new_02.length + new_03.length
              let killer = 100
              const col_total = gm.columns + columns
              while (total) {
                switch (direction) {
                  case "across":
                    for (let i = 0; i < col_total; i++) {
                      if (i % 2) {
                        final.push(new_01.shift())
                      } else {
                        final.push(new_00.shift())
                      }
                      if (i === col_total - 1) direction = "middle"
                    }
                    break
                  case "middle":
                    // if (total <= 7) break
                    for (let i = 0; i < col_total; i++) {
                      if (i % 2) {
                        final.push(new_03.shift())
                      } else {
                        final.push(new_02.shift())
                      }
                      if (i === col_total - 1) direction = "across"
                    }
                    break
                  default:
                    break
                }

                total = new_00.length + new_01.length + new_02.length + new_03.length

                if (--killer <= 0) {
                  break
                }
              }

              dummy.doublePoints(final)

              setForceUpdate(Math.random())

              // width: ${GridManager.width}, height: ${GridManager.height}, width: ${GridManager.width}, height: ${GridManager.height},  `
            }}
          >
            <p>Double Points</p>
          </div>
          <div
            className="button"
            onClick={() => {
              const attributes = ["width", "height", "columns", "rows"]
              let output = `{ `
              const gm = dummy.meshCanvas.gridManager
              attributes.forEach(attribute => {
                output += `"${attribute}": ${gm[attribute]} , `
              })
              output += `"positions": [ `
              gm.positions.forEach((coord, index) => {
                output += `{ "x": ${coord.x}, "y": ${coord.y} }`
                if (gm.positions[index + 1]) output += ", "
              })
              output += `], "rootPositions": [ `

              gm.rootPositions.forEach((coord, index) => {
                output += `{ "x": ${coord.x}, "y": ${coord.y} }`
                if (gm.positions[index + 1]) output += ", "
              })
              output += "]"

              output += "}"

              // width: ${GridManager.width}, height: ${GridManager.height}, width: ${GridManager.width}, height: ${GridManager.height},  `
            }}
          >
            <p>Output Points</p>
          </div>
        </div>
      </div>
    </div>
  )
})

export default Builder
