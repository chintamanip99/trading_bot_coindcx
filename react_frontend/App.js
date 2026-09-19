import React, { useState, useEffect } from 'react';

function TradingDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = () => {
    fetch('http://192.168.29.2:5000/trade_logs')
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          setData(result);
          setError(null);
        } else {
          setError(result.error);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 3000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (error) return <div style={{ padding: 20, color: 'red' }}>Error: {error}</div>;
  if (!data) return <div style={{ padding: 20 }}>No data</div>;

  const signal = data.signal_data || {};
  const balance = data.balance || {};
  const positions = data.active_positions || [];
  const logs = data.trade_logs || [];

  return (
    <div style={{ padding: 20, fontFamily: 'Arial', background: '#111', color: '#eee', minHeight: '100vh' }}>
      <h1>Coindcx Trading Dashboard</h1>
      <p>Mode: <b>{data.trading_mode}</b> | Last Price: <b>{data.last_price}</b></p>

      <hr />

      {/* BALANCE */}
      <h2>Balance</h2>
      <p>Current: ${balance.current}</p>
      <p>Initial: ${balance.initial}</p>
      <p>Total P&L: ${balance.total_pnl}</p>
      <p>Total Fees: ${balance.total_fees}</p>

      <hr />

      {/* SIGNALS */}
      <h2>Signals</h2>
      <p>Combined Signal: <b>{signal.signal}</b> (1=Long, 2=Short, 0=None)</p>
      <p>Confidence: {(signal.confidence * 100).toFixed(2)}%</p>
      <p>Reason: {signal.reason}</p>
      <p>Consensus: {signal.consensus_achieved ? 'YES' : 'NO'}</p>

      <h3>Individual Models</h3>
      <ul>
        <li>LSTM: signal={signal.lstm_signal}, confidence={(signal.lstm_confidence * 100).toFixed(2)}%</li>
        <li>CNN: signal={signal.cnn_signal}, confidence={(signal.cnn_confidence * 100).toFixed(2)}%, pattern={signal.cnn_pattern}</li>
        <li>SARIMAX: signal={signal.sarimax_signal}, confidence={(signal.sarimax_confidence * 100).toFixed(2)}%</li>
      </ul>

      <h3>Indicators</h3>
      <ul>
        <li>RSI: {signal.rsi}</li>
        <li>BB Position: {signal.bb_position}</li>
        <li>Volume Ratio: {signal.volume_ratio}</li>
        <li>MACD Hist: {signal.macd_hist}</li>
      </ul>

      <hr />

      {/* ACTIVE POSITIONS */}
      <h2>Active Positions ({positions.length})</h2>
      {positions.length === 0 ? (
        <p>No active positions</p>
      ) : (
        <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Entry</th>
              <th>Target</th>
              <th>Stop Loss</th>
              <th>Shares</th>
              <th>P&L</th>
              <th>Filled</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p, i) => (
              <tr key={i}>
                <td>{p.type}</td>
                <td>{p.entry_price}</td>
                <td>{p.target}</td>
                <td>{p.stop_loss}</td>
                <td>{p.shares}</td>
                <td>{p.pnl}</td>
                <td>{p.order_filled ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <hr />

      {/* TRADE LOGS */}
      <h2>Trade Logs ({logs.length})</h2>
      <div style={{ maxHeight: 500, overflowY: 'scroll', background: '#000', padding: 10 }}>
        {logs.length === 0 ? (
          <p>No logs yet</p>
        ) : (
          logs.slice().reverse().map((log, i) => (
            <div key={i} style={{ borderBottom: '1px solid #333', padding: 6 }}>
              <small>{log.timestamp}</small> [{log.type}] {log.message}
            </div>
          ))
        )}
      </div>

      <hr />

      {/* CLOSED POSITIONS */}
      <h2>Closed Positions ({data.closed_positions_count})</h2>
      {data.closed_positions && data.closed_positions.length > 0 && (
        <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>P&L</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {data.closed_positions.slice().reverse().map((p, i) => (
              <tr key={i}>
                <td>{p.type}</td>
                <td>{p.entry_price}</td>
                <td>{p.exit_price}</td>
                <td>{p.pnl}</td>
                <td>{p.exit_reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TradingDashboard;
