import React, { useState, useEffect, useRef } from "react";
import "./styles.css";

export default function App() {
  // The number of antennas, we probably don't need
  // anything to change this.
  const [numAntennas] = useState(6);

  // The number of baselines, we probably don't need
  // anything to change this.
  const [numBaselines] = useState(15);

  // The number of continuum windows.
  const [numContinuumWindows, setNumContinuumWindows] = useState(4);
  const refNumContinuumWindows = useRef(null);

  // The number of channels per continuum window.
  const [numContinuumChannels, setNumContinuumChannels] = useState(1920);
  const refNumContinuumChannels = useRef(null);

  // The number of spectral windows to use.
  const [numSpectralWindows, setNumSpectralWindows] = useState(0);
  const refNumSpectralWindows = useRef(null);

  // Details about each of the spectral windows, we'll
  // have to make a routine to alter these.
  const [numSpectralWindowChannels, setNumSpectralWindowChannels] = useState(
    []
  );

  // The number of bins to use per cycle, in the
  // cross-correlations.
  const [numBins, setNumBins] = useState(0);
  const refNumBins = useRef(null);

  // The number of Stokes parameters, we probably don't
  // need anything to change this.
  const [numStokes] = useState(4);

  // The cycle time, in seconds.
  const [cycleTime, setCycleTime] = useState(10);
  const refCycleTime = useRef(null);

  // The bit depth for the output data.
  const [bitDepth, setBitDepth] = useState(32);
  const refBitDepth = useRef(null);

  // The number of Tsys bins per continuum window.
  const [tsysBins, setTsysBins] = useState(4);
  const refTsysBins = useRef(null);

  // The number of Tsys parameters recorded.
  // These are: 1 - minimum chan of Tsys
  //            2 - maximum chan of Tsys
  //            3 - GTP
  //            4 - SDO
  //            5 - Tsys
  //            6 - Tcal (the noise diode amplitude)
  //            7 - JyPerK
  const [numTsysRecords] = useState(7);

  // The number of antenna-based metadata parameters
  // that require numbers.
  // These are: 1 - focus position
  //            2 - azimuth position
  //            3 - elevation position
  //            4 - azimuth max error
  //            5 - elevation max error
  //            6 - azimuth offset
  //            7 - elevation offset
  //            8 - chi
  //            9 - right ascension
  //           10 - declination
  const [numMetadataNumbers] = useState(10);

  // The number of site-based metadata parameters
  // that require numbers.
  // These are: 1 - ambient temperature
  //            2 - air pressure
  //            3 - relative humidity
  //            4 - wind speed
  //            5 - wind direction
  //            6 - rain gauge
  //            7 - seeing monitor phase
  //            8 - seeing monitor RMS
  //            9 - datetime
  const [numMetadataGlobalNumbers] = useState(9);

  // The number of baseline-based metadata parameters
  // that require numbers.
  // These are: 1 - u
  //            2 - v
  //            3 - w
  const [numMetadataCrossNumbers] = useState(3);

  // The number of antenna-based metadata parameters
  // that are Boolean.
  // These are: 1 - is antenna tracking and configured
  //            2 - is paddle in
  const [numMetadataBools] = useState(2);

  // The number of scan-based metadata parameters that
  // are numbers, for each antenna.
  // These are: 1 - antenna number
  //            2 - X position
  //            3 - Y position
  //            4 - Z position
  //            5 - pointing correction az
  //            6 - pointing correction el
  //            7 - datetime of pointing correction
  const [numMetadataScanAntennaNumbers] = useState(7);

  // The number of scan-based metadata parameters that
  // are numbers, for each window.
  // These are: 1 - window number
  //            2 - frequency in channel 1
  //            3 - frequency interval
  //            4 - number of channels
  //            5 - window rest frequency
  //            6 - window source velocity
  const [numMetadataScanWindowNumbers] = useState(6);

  // The number of scan-based metadata parameters that
  // are numbers.
  // These are: 1 - scan length
  //            2 - scan start datetime
  const [numMetadataScanNumbers] = useState(2);

  // The number of scan-based metadata parameters that
  // are strings, each character being 1 byte.
  // This is a total of all bytes.
  // These are: 1 - 10 - scan type
  //           11 - 20 - observer
  //           21 - 40 - source name
  //           41 - 50 - coordinate system
  //           51 - 60 - scan source code
  //           61 - 70 - project code
  //           71 -170 - log entry
  const [numMetadataScanStringBytes] = useState(170);

  // The output amount of data per antenna, for
  // antenna-based parameters.
  const [dataPerAntenna, setDataPerAntenna] = useState(0);

  // The output amount of data per baseline, for
  // baseline-based parameters.
  const [dataPerBaseline, setDataPerBaseline] = useState(0);

  // The number of scans per hour.
  const [scansPerHour, setScansPerHour] = useState(4);
  const refScansPerHour = useRef(null);

  // The output amount of data for scan-based metadata,
  // which doesn't need to change very often.
  const [dataPerScan, setDataPerScan] = useState(0);

  // The output amount of data per cycle, in bits.
  const [dataPerCycle, setDataPerCycle] = useState(0);
  // The output data rate, in bits/sec.
  const [dataRate, setDataRate] = useState(0);

  // The units to show results in.
  const [outputDataUnits, setOutputDataUnits] = useState("bits");
  const dataUnitsRef = useRef(null);
  const [outputTimeUnits, setOutputTimeUnits] = useState("sec");
  const timeUnitsRef = useRef(null);
  // Some scales to convert these units.
  const dataDivisors = {
    bits: 1,
    bytes: 8,
    KB: 8000,
    KiB: 8192,
    MB: 8000000,
    MiB: 8388608,
    GB: 8000000000,
    GiB: 8589934592
  };
  const timeMultipliers = {
    sec: 1,
    min: 60,
    hour: 3600,
    day: 86400
  };
  const objValCmp = function (a, b, d) {
    if (d[a] < d[b]) {
      return -1;
    }
    if (d[a] > d[b]) {
      return 1;
    }
    return 0;
  };
  const availableDataDivisors = Object.keys(dataDivisors).sort((a, b) => {
    return objValCmp(a, b, dataDivisors);
  });
  const availableTimeMultipliers = Object.keys(timeMultipliers).sort((a, b) => {
    return objValCmp(a, b, timeMultipliers);
  });
  const dataUnitsChanged = function () {
    setOutputDataUnits(dataUnitsRef.current.value);
  };
  const timeUnitsChanged = function () {
    setOutputTimeUnits(timeUnitsRef.current.value);
  };

  // This routine watches for changes in the amount of
  // data being generated per cycle, or the cycle time
  // and recalculates the data rate.
  useEffect(() => {
    setDataRate(dataPerCycle / cycleTime);
  }, [dataPerCycle, cycleTime]);

  // This routine watches for changes to the parameters
  // which would change the amount of data being generated
  // per antenna, and recalculates this data volume.
  useEffect(() => {
    var dataPerAutoChannel = bitDepth * numStokes * 2 * (numBins + 2);
    var dataInAutoContinuum =
      numContinuumWindows * numContinuumChannels * dataPerAutoChannel;
    var dataPerContinuumTsysRecord =
      numTsysRecords * tsysBins * bitDepth * 2 * (numBins + 1);
    var dataInContinuumTsys = numContinuumWindows * dataPerContinuumTsysRecord;
    var dataPerMetadataNumber = numMetadataNumbers * bitDepth;
    var dataPerMetadataBool =
      (numMetadataBools +
        numContinuumWindows * numContinuumChannels * numStokes) *
      1;
    var dataInAutoSpectralWindows = 0;
    for (var i = 0; i < numSpectralWindows; i++) {
      dataInAutoSpectralWindows +=
        numSpectralWindowChannels[i] * dataPerAutoChannel;
      dataPerMetadataBool += numSpectralWindowChannels[i] * numStokes * 1;
    }
    var dataPerSpectralTsysRecord =
      numTsysRecords * bitDepth * 2 * (numBins + 1);
    setDataPerAntenna(
      dataInAutoContinuum +
        dataInContinuumTsys +
        dataPerMetadataBool +
        dataPerMetadataNumber +
        dataInAutoSpectralWindows +
        dataPerSpectralTsysRecord
    );
  }, [
    bitDepth,
    numStokes,
    numBins,
    numTsysRecords,
    tsysBins,
    numMetadataNumbers,
    numMetadataBools,
    numContinuumChannels,
    numContinuumWindows,
    numSpectralWindows,
    numSpectralWindowChannels
  ]);

  // This routine watches for changes to the parameters
  // which would change the amount of data being generated
  // per baseline, and recalculates this data volume.
  useEffect(() => {
    var dataPerCrossChannel = bitDepth * numStokes * 2 * (numBins + 1);
    var dataInCrossContinuum =
      numContinuumWindows * numContinuumChannels * dataPerCrossChannel;
    var dataPerMetadataBool =
      numContinuumWindows * numContinuumChannels * numStokes * 1;
    var dataPerMetadataNumber =
      numContinuumWindows * numContinuumChannels * numMetadataCrossNumbers;
    var dataInCrossSpectralWindows = 0;
    for (var i = 0; i < numSpectralWindows; i++) {
      dataInCrossSpectralWindows +=
        numSpectralWindowChannels[i] * dataPerCrossChannel;
      dataPerMetadataBool += numSpectralWindowChannels[i] * numStokes * 1;
      dataPerMetadataNumber +=
        numSpectralWindowChannels[i] * numMetadataCrossNumbers;
    }
    setDataPerBaseline(
      dataInCrossContinuum +
        dataPerMetadataBool +
        dataInCrossSpectralWindows +
        dataPerMetadataNumber
    );
  }, [
    bitDepth,
    numStokes,
    numBins,
    numContinuumWindows,
    numContinuumChannels,
    numSpectralWindowChannels,
    numSpectralWindows,
    numMetadataCrossNumbers
  ]);

  // This routine watches for changes to the parameters
  // which would change the amount of data being generated
  // per cycle, and recalculates this data volume.
  useEffect(() => {
    setDataPerCycle(
      numAntennas * dataPerAntenna +
        numBaselines * dataPerBaseline +
        numMetadataGlobalNumbers * bitDepth
    );
  }, [
    dataPerAntenna,
    dataPerBaseline,
    numAntennas,
    numBaselines,
    numMetadataGlobalNumbers,
    bitDepth
  ]);

  // This routine watches for changes to the parameters
  // which would change the amount of data being generated
  // per scan, and recalculates this data volume.
  useEffect(() => {
    var dataPerAntenna = numMetadataScanAntennaNumbers * numAntennas * bitDepth;
    var dataPerWindow =
      numMetadataScanWindowNumbers *
      (numSpectralWindows + numContinuumWindows) *
      bitDepth;
    var metadataPerScan =
      dataPerAntenna +
      dataPerWindow +
      numMetadataScanNumbers * bitDepth +
      numMetadataScanStringBytes * 8;
    var metadataPerHour = metadataPerScan * scansPerHour;
    setDataPerScan(metadataPerHour / 3600);
  }, [
    numMetadataScanAntennaNumbers,
    numAntennas,
    bitDepth,
    numMetadataScanWindowNumbers,
    numSpectralWindows,
    numContinuumWindows,
    numMetadataScanNumbers,
    numMetadataScanStringBytes,
    scansPerHour
  ]);

  // A handler that produces a generic function that
  // enables the calculator to do its thing when an
  // input box changes to a valid value.
  const onChangeHandler = function (ref, setter) {
    return function (e) {
      var val = parseInt(ref.current.value, 10);
      if (!isNaN(val)) {
        setter(val);
      }
    };
  };

  // When the number of spectral windows changes,
  // we set any new windows to have a default of 2048
  // channels, but by doing it this way we can keep
  // old values the user entered if they reduce the
  // number of windows, but then increase it again later.
  useEffect(() => {
    var l = [...numSpectralWindowChannels];
    var changed = numSpectralWindows > l.length;
    while (numSpectralWindows > l.length) {
      l.push(2048);
    }
    if (changed) {
      setNumSpectralWindowChannels(l);
    }
  }, [numSpectralWindows, numSpectralWindowChannels]);

  const changeNumChannelsSpectralWindow = function (e) {
    var w = parseInt(e.target.id.replace("numChannelsSpectralWindow_", ""), 10);
    var l = [...numSpectralWindowChannels];
    var val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      if (val >= 2) {
        l[w] = val;
      } else {
        l[w] = 2;
      }
      setNumSpectralWindowChannels(l);
    }
  };

  // Some range checkers.
  useEffect(() => {
    if (cycleTime <= 0) {
      setCycleTime(1);
    }
  }, [cycleTime]);

  useEffect(() => {
    if (bitDepth % 8) {
      setBitDepth(32);
    }
  }, [bitDepth]);

  useEffect(() => {
    if (scansPerHour < 0) {
      setScansPerHour(0);
    }
  }, [scansPerHour]);

  useEffect(() => {
    if (numBins < 0) {
      setNumBins(0);
    }
  }, [numBins]);

  useEffect(() => {
    if (numContinuumWindows < 1) {
      setNumContinuumWindows(1);
    }
  }, [numContinuumWindows]);

  useEffect(() => {
    if (numContinuumChannels < 2) {
      setNumContinuumChannels(2);
    }
  }, [numContinuumChannels]);

  useEffect(() => {
    if (tsysBins < 1) {
      setTsysBins(1);
    } else if (tsysBins > numContinuumChannels) {
      setTsysBins(numContinuumChannels);
    }
  }, [numContinuumChannels, tsysBins]);

  useEffect(() => {
    if (numSpectralWindows < 0) {
      setNumSpectralWindows(0);
    }
  }, [numSpectralWindows]);

  return (
    <div className="App">
      <h1>BIGCAT data rate calculator</h1>
      <b>Parameters:</b>
      <table id="parameterTable">
        <tbody>
          <tr>
            <th>Number of antennas:</th>
            <td>{numAntennas}</td>
            <td>
              <img
                className="helpIcon"
                src="question-circle.svg"
                title="The number of antennas assumed by this calculator; it can be changed in code if desired."
                alt="Help Icon"
              />
            </td>
          </tr>
          <tr>
            <th>Number of Stokes parameters:</th>
            <td>{numStokes}</td>
            <td>
              <img
                className="helpIcon"
                src="question-circle.svg"
                title="The number of Stokes parameters assumed by this calculator (I,Q,U,V); it can be changed in code if desired."
                alt="Help Icon"
              />
            </td>
          </tr>
          <tr>
            <th>Cycle time (s):</th>
            <td>
              <input
                name="cycleTime"
                ref={refCycleTime}
                placeholder={cycleTime}
                onChange={onChangeHandler(refCycleTime, setCycleTime)}
              />
            </td>
            <td>
              <img
                className="helpIcon"
                src="question-circle.svg"
                title="The time per cycle, which is used to determine the output data rate. This is specified in seconds."
                alt="Help Icon"
              />
            </td>
          </tr>
          <tr>
            <th>Output Bit Depth:</th>
            <td>
              <input
                name="bitDepth"
                ref={refBitDepth}
                placeholder={bitDepth}
                onChange={onChangeHandler(refBitDepth, setBitDepth)}
              />
            </td>
            <td>
              <img
                className="helpIcon"
                src="question-circle.svg"
                title="The number of bits per number that is output. A complex visibility consists of two numbers (one for real and one for imaginary)."
                alt="Help Icon"
              />
            </td>
          </tr>
          <tr>
            <th>Average number of scans per hour:</th>
            <td>
              <input
                name="scansPerHour"
                ref={refScansPerHour}
                placeholder={scansPerHour}
                onChange={onChangeHandler(refScansPerHour, setScansPerHour)}
              />
            </td>
            <td>
              <img
                className="helpIcon"
                src="question-circle.svg"
                title="The metadata which is output once per scan will be included this many times per hour, for the output data rate. A new scan is required whenever the source or frequency setup changes."
                alt="Help Icon"
              />
            </td>
          </tr>
          <tr>
            <th>Number of pulse or time bins:</th>
            <td>
              <input
                name="numBins"
                ref={refNumBins}
                placeholder={numBins}
                onChange={onChangeHandler(refNumBins, setNumBins)}
              />
            </td>
            <td>
              <img
                className="helpIcon"
                src="question-circle.svg"
                title="The number of extra bins required for high-time-resolution or pulsar binning. A single bin for the continuum, and a second bin for the noise diode demodulation in the autocorrelations is included in addition to the number of bins specified here."
                alt="Help Icon"
              />
            </td>
          </tr>
          <tr>
            <th>Number of continuum windows:</th>
            <td>
              <input
                name="numContinuumWindows"
                ref={refNumContinuumWindows}
                placeholder={numContinuumWindows}
                onChange={onChangeHandler(
                  refNumContinuumWindows,
                  setNumContinuumWindows
                )}
              />
            </td>
            <td>
              <img
                className="helpIcon"
                src="question-circle.svg"
                title="The number of windows at continuum resolution; the number of channels in each window will be set by the next row down."
                alt="Help Icon"
              />
            </td>
          </tr>
          <tr>
            <th>Number of channels per continuum window:</th>
            <td>
              <input
                name="numContinuumChannels"
                ref={refNumContinuumChannels}
                placeholder={numContinuumChannels}
                onChange={onChangeHandler(
                  refNumContinuumChannels,
                  setNumContinuumChannels
                )}
              />
            </td>
            <td>
              <img
                className="helpIcon"
                src="question-circle.svg"
                title="The number of channels in each window at continuum resolution."
                alt="Help Icon"
              />
            </td>
          </tr>
          <tr>
            <th>Number of Tsys bins per continuum window:</th>
            <td>
              <input
                name="tsysBins"
                ref={refTsysBins}
                placeholder={tsysBins}
                onChange={onChangeHandler(refTsysBins, setTsysBins)}
              />
            </td>
            <td>
              <img
                className="helpIcon"
                src="question-circle.svg"
                title="Each continuum window will be divided into this many equal-frequency-width bins, and a system temperature will be calculated for each of these bins. This number can be anywhere from 1 to the same number of channels in the continuum window."
                alt="Help Icon"
              />
            </td>
          </tr>
          <tr>
            <th>Number of spectral windows:</th>
            <td>
              <input
                name="numSpectralWindows"
                ref={refNumSpectralWindows}
                placeholder={numSpectralWindows}
                onChange={onChangeHandler(
                  refNumSpectralWindows,
                  setNumSpectralWindows
                )}
              />
            </td>
            <td>
              <img
                className="helpIcon"
                src="question-circle.svg"
                title="The number of spectral-resolution windows you want. For each window, a new row will be shown below, which can be used to specify how many channels to use in that window."
                alt="Help Icon"
              />
            </td>
          </tr>
          {[...Array(numSpectralWindows)].map((x, i) => {
            return (
              <tr key={"spectralWindowRow" + i}>
                <th>Channels in spectral window {i + 1}:</th>
                <td>
                  <input
                    name={"numChannelsSpectralWindow" + (i + 1)}
                    placeholder={numSpectralWindowChannels[i]}
                    id={"numChannelsSpectralWindow_" + i}
                    onChange={changeNumChannelsSpectralWindow}
                  />
                </td>
                <td>
                  <img
                    className="helpIcon"
                    src="question-circle.svg"
                    title="Each spectral window can have any number of channels (although a minimum of 2 channels)."
                    alt="Help Icon"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="results">
        <h3>Results Summary (will update automatically)</h3>
        <table id="resultsTable">
          <thead>
            <tr>
              <th>Show results in</th>
              <td>
                <select
                  id="dataUnits"
                  ref={dataUnitsRef}
                  onChange={dataUnitsChanged}
                >
                  {availableDataDivisors.map((v) => {
                    return (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    );
                  })}
                </select>
              </td>
              <td>
                <select
                  id="timeUnits"
                  ref={timeUnitsRef}
                  onChange={timeUnitsChanged}
                >
                  {availableTimeMultipliers.map((v) => {
                    return (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    );
                  })}
                </select>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Output data per cycle:</th>
              <td>
                {(dataPerCycle / dataDivisors[outputDataUnits]).toFixed(3)}{" "}
                {outputDataUnits}
              </td>
              <td>
                <img
                  className="helpIcon"
                  src="question-circle.svg"
                  title="The amount of data output in each cycle, including metadata, but excluding any scan-based metadata."
                  alt="Help Icon"
                />
              </td>
            </tr>
            <tr>
              <th>Output data rate:</th>
              <td>
                {(
                  (dataRate * timeMultipliers[outputTimeUnits]) /
                    dataDivisors[outputDataUnits] +
                  (dataPerScan * timeMultipliers[outputTimeUnits]) /
                    dataDivisors[outputDataUnits]
                ).toFixed(4)}{" "}
                {outputDataUnits}/{outputTimeUnits}
              </td>
              <td>
                <img
                  className="helpIcon"
                  src="question-circle.svg"
                  title="The average data rate in the selected time period, which includes the metadata for the specified average number of scans per hour."
                  alt="Help Icon"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
