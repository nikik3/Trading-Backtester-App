import pandas as pd
import io
from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# --- Pydantic Models for Response ---

class EquityPoint(BaseModel):
    """Defines the structure for a single point on the equity curve graph."""
    date: str
    value: float

class ErrorResponse(BaseModel):
    """Defines the structure for an error message."""
    detail: str

# --- Initialize FastAPI App ---

app = FastAPI(
    title="Equity Curve Generator API",
    description="Upload a CSV with trade data to generate a buy-and-hold equity curve."
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for simplicity
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Endpoint ---

@app.post(
    "/equity_curve",
    response_model=list[EquityPoint],
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Calculate Buy-and-Hold Equity Curve"
)
async def create_equity_curve(
    file: UploadFile = File(..., description="A CSV file with 'Date' and 'Close' columns."),
    initial_cash: float = Query(10000.0, gt=0, description="The starting investment amount.")
):
    """
    Accepts a CSV file, calculates a simple buy-and-hold equity curve, 
    and returns an array of graph points in JSON format.
    
    The CSV must contain at least two columns:
    - *Date*: The date of the price data (e.g., YYYY-MM-DD).
    - *Close*: The closing price for that day.
    """
    try:
        # Read the uploaded file's content into memory
        content = await file.read()
        csv_data = io.StringIO(content.decode('utf-8'))

        # Load the data into a pandas DataFrame
        df = pd.read_csv(csv_data)

        # --- 1. Validate and Prepare Data ---
        required_cols = ['Date', 'Close']
        if not all(col in df.columns for col in required_cols):
            raise HTTPException(
                status_code=400,
                detail=f"CSV must contain the following columns: {', '.join(required_cols)}"
            )

        df['Date'] = pd.to_datetime(df['Date'])
        df = df.sort_values(by='Date').reset_index(drop=True)

        # --- 2. Calculate Equity Curve ---
        df['daily_return'] = df['Close'].pct_change().fillna(0)
        df['cumulative_return'] = (1 + df['daily_return']).cumprod()
        df['equity'] = initial_cash * df['cumulative_return']

        # --- 3. Format Output ---
        output_df = df[['Date', 'equity']].copy()
        output_df['Date'] = output_df['Date'].dt.strftime('%Y-%m-%d')
        output_df['equity'] = output_df['equity'].round(2)
        output_df = output_df.rename(columns={'Date': 'date', 'equity': 'value'})

        # Convert to a list of dictionaries and return
        return output_df.to_dict('records')

    except Exception as e:
        # Catch any other errors and return a helpful response
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

