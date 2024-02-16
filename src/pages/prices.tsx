import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useSession } from 'next-auth/react';

import { Button, Spinner } from 'react-bootstrap';
import Layout from '@/components/Layout';
import ArtCostComponent from '@/components/pricing/ArtCost';
import WholesaleMarkup from '@/components/pricing/WholesaleMarkup';
import PrintingQuantityRanges from '@/components/pricing/PrintingQuantityRanges';
import PrintingLocationNames from '@/components/pricing/PrintingLocationNames';
import DTGPrinting from '@/components/pricing/DTGPrinting';
import DyeSublimation from '@/components/pricing/DyeSublimation';
import PreCutVinyl from '@/components/pricing/PreCutVinyl';
import Embroidery from '@/components/pricing/Embroidery';
import WholesaleWebsites from '@/components/pricing/WholesaleWebsites';
import ScreenPrinting from '@/components/pricing/ScreenPrinting';

import { Price } from '@/types/Price';

interface ApiResponse {
	success: boolean;
	prices: Price;
}

const Prices: NextPage = () => {
	const { data: session } = useSession();
	const [priceData, setPriceData] = useState<ApiResponse | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (session) {
			setIsLoading(true);
			// Ensure the session is loaded and available
			const fetchData = async () => {
				try {
					const companyId = '65cc4e6693586cfad61e0788'; // Assuming 'companyId' is stored in the session user object

					if (companyId) {
						const response = await fetch(
							`/api/prices/get?CompanyId=${companyId}`
						);

						const data = await response.json();
						//console.log(data);

						if (data.success) {
							setPriceData(data);
						} else {
							console.error('Failed to fetch prices');
						}
					}
				} catch (error) {
					console.error('Fetching error:', error);
					setError('Error fetching data');
				} finally {
					setIsLoading(false);
				}
			};

			fetchData();
		}
	}, [session]);

	// Handler for the save button
	const handleSave = async () => {
		try {
			const response = await fetch('/api/prices/update', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(priceData),
			});

			if (response.ok) {
				console.log('Prices updated successfully');
			} else {
				console.error('Failed to update prices');
			}
		} catch (error) {
			console.error('Error updating prices:', error);
		}
	};

	// if (priceData && priceData.prices) {
	// 	console.log(priceData.prices.dtgPrinting);
	// }

	return (
		<Layout>
			<div className='container mt-5'>
				<h1>Prices</h1>
				{isLoading && <Spinner animation='border' />}
				{priceData && priceData.prices ? (
					<>
						<ArtCostComponent
							artCostData={priceData?.prices.artCost}
							setArtCostData={(updatedArtCost) => {
								if (priceData && priceData.prices) {
									setPriceData({
										...priceData,
										prices: { ...priceData.prices, artCost: updatedArtCost },
									});
								}
							}}
						/>
						<DTGPrinting
							dtgPrintingData={priceData.prices.dtgPrinting}
							setDTGPrintingData={(updatedDTGPrinting) => {
								setPriceData({
									...priceData,
									prices: {
										...priceData.prices,
										dtgPrinting: updatedDTGPrinting,
									},
								});
							}}
						/>

						<WholesaleMarkup
							wholesaleMarkupData={priceData.prices.wholesaleMarkup}
							setWholesaleMarkupData={(updatedWholesaleMarkup) => {
								setPriceData({
									...priceData,
									prices: {
										...priceData.prices,
										wholesaleMarkup: updatedWholesaleMarkup,
									},
								});
							}}
						/>
						<PrintingQuantityRanges
							quantityRanges={priceData.prices.printingQuantityRanges}
							setQuantityRanges={(updatedRanges) => {
								setPriceData({
									...priceData,
									prices: {
										...priceData.prices,
										printingQuantityRanges: updatedRanges,
									},
								});
							}}
						/>
						<PrintingLocationNames
							printingLocationNames={priceData.prices.printingLocationNames}
							setPrintingLocationNames={(updatedNames) => {
								setPriceData({
									...priceData,
									prices: {
										...priceData.prices,
										printingLocationNames: updatedNames,
									},
								});
							}}
						/>
						<DyeSublimation
							dyeSubData={priceData.prices.dyeSublimation}
							setDyeSubData={(updatedDyeSubData) => {
								setPriceData({
									...priceData,
									prices: {
										...priceData.prices,
										dyeSublimation: updatedDyeSubData,
									},
								});
							}}
						/>
						<PreCutVinyl
							preCutVinylData={priceData.prices.preCutVinyl}
							setPreCutVinylData={(updatedPreCutVinylData) => {
								setPriceData({
									...priceData,
									prices: {
										...priceData.prices,
										preCutVinyl: updatedPreCutVinylData,
									},
								});
							}}
						/>
						<Embroidery
							embroideryData={priceData.prices.embroidery}
							setEmbroideryData={(updatedEmbroidery) => {
								setPriceData({
									...priceData,
									prices: {
										...priceData.prices,
										embroidery: updatedEmbroidery,
									},
								});
							}}
						/>
						<ScreenPrinting
							screenPrintingData={priceData.prices.screenPrinting}
							setScreenPrintingData={(updatedScreenPrinting) => {
								setPriceData({
									...priceData,
									prices: {
										...priceData.prices,
										screenPrinting: updatedScreenPrinting,
									},
								});
							}}
						/>
						<WholesaleWebsites
							websites={priceData.prices.wholesaleWebsites}
							setWebsites={(updatedWebsites) => {
								setPriceData({
									...priceData,
									prices: {
										...priceData.prices,
										wholesaleWebsites: updatedWebsites,
									},
								});
							}}
						/>
					</>
				) : (
					<div>No pricing data available.</div>
				)}
				{error && <div>Error: {error}</div>}

				<Button onClick={handleSave}>Save Changes</Button>
			</div>
		</Layout>
	);
};

export default Prices;
