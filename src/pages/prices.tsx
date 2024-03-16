import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import { Button, Container, Row, Col, Spinner } from 'react-bootstrap';
import Layout from '@/components/Layout';
import ArtCostComponent from '@/components/pricing/ArtCost';
import WholesaleMarkupComponent from '@/components/pricing/WholesaleMarkup';
import PrintingQuantityRanges from '@/components/pricing/PrintingQuantityRanges';
import PrintingLocationNames from '@/components/pricing/PrintingLocationNames';
import DTGPrinting from '@/components/pricing/DTGPrinting';
import DyeSublimation from '@/components/pricing/DyeSublimation';
import PreCutVinyl from '@/components/pricing/PreCutVinyl';
import Embroidery from '@/components/pricing/Embroidery';
import ScreenPrinting from '@/components/pricing/ScreenPrinting';
import { Price } from '@/types/Price';
import DTGDarkGarmentMarkupComponent from '@/components/pricing/DTGDarkGarmentMarkup';

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
					const companyId = session.user.companyId;
					if (companyId) {
						const response = await fetch(`/api/prices/${companyId}`);

						const data = await response.json();

						console.log(data);

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

	//console.log(priceData?.prices);

	return (
		<Layout>
			<Container fluid>
				<Row>
					<Col
						md={12}
						lg={12}
						style={{ paddingLeft: 0 }}
					>
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
												prices: {
													...priceData.prices,
													artCost: updatedArtCost,
												},
											});
										}
									}}
								/>
								<WholesaleMarkupComponent
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
								<DTGDarkGarmentMarkupComponent
									dtgDarkGarmentMarkup={priceData.prices.dtgDarkGarmentMarkup}
									setDTGDarkGarmentMarkup={(updatedMarkup) => {
										setPriceData({
											...priceData,
											prices: {
												...priceData.prices,
												dtgDarkGarmentMarkup: updatedMarkup,
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
							</>
						) : (
							<div>No pricing data available.</div>
						)}
						{error && <div>Error: {error}</div>}
						<Button onClick={handleSave}>Save Changes</Button>
					</Col>
				</Row>
			</Container>
		</Layout>
	);
};

export default Prices;
